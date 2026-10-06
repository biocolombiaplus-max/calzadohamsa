'use client';

import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { saveWonCoupon } from './coupon';
import type { Order, ReviewRequest, ReviewRequestItem } from './types';

const REQUESTS = 'reviewRequests';
const COUPONS = 'rewardCoupons';
const REVIEW_BONUS_PERCENT = 10;
const REVIEW_BONUS_DAYS = 15;

function toMillis(value: unknown): number | undefined {
  return value instanceof Timestamp ? value.toMillis() : typeof value === 'number' ? value : undefined;
}

function toReviewRequest(id: string, data: any): ReviewRequest {
  return {
    id,
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    items: data.items ?? [],
    linkSentAt: toMillis(data.linkSentAt) ?? null,
    rating: data.rating ?? null,
    reviewText: data.reviewText ?? '',
    reviewPhotos: data.reviewPhotos ?? [],
    reviewSubmittedAt: toMillis(data.reviewSubmittedAt) ?? null,
    couponCode: data.couponCode,
    couponPercent: data.couponPercent ?? REVIEW_BONUS_PERCENT,
    couponExpiresAt: toMillis(data.couponExpiresAt) ?? null,
    couponUsedAt: toMillis(data.couponUsedAt) ?? null,
    couponUsedOrderId: data.couponUsedOrderId ?? null,
    createdAt: toMillis(data.createdAt) ?? 0,
  };
}

function generateCouponCode(orderNumber: string): string {
  const suffix = orderNumber.split('-').pop() || Math.random().toString(36).slice(2, 6);
  const random = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `GRACIAS${suffix}${random}`;
}

// La administradora le da "Enviar reseña y bono" a un pedido — crea (la
// primera vez) o reutiliza (si ya existía) el documento con un código de
// cupón propio para esa clienta, y marca que el link se acaba de enviar.
export async function sendReviewRequest(order: Order): Promise<ReviewRequest> {
  if (!db) throw new Error('Firestore no está disponible.');
  const ref = doc(db, REQUESTS, order.id);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await updateDoc(ref, { linkSentAt: serverTimestamp() });
    const refreshed = await getDoc(ref);
    return toReviewRequest(refreshed.id, refreshed.data());
  }

  const couponCode = generateCouponCode(order.orderNumber);
  const items: ReviewRequestItem[] = order.items.map((i) => ({ title: i.title, size: i.size, color: i.color }));

  await setDoc(ref, {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    items,
    linkSentAt: serverTimestamp(),
    rating: null,
    reviewText: '',
    reviewPhotos: [],
    reviewSubmittedAt: null,
    couponCode,
    couponPercent: REVIEW_BONUS_PERCENT,
    couponExpiresAt: null,
    couponUsedAt: null,
    couponUsedOrderId: null,
    createdAt: serverTimestamp(),
  });

  // Copia pública mínima (sin nombre ni teléfono) para que el checkout
  // pueda validar el código sin necesitar permisos de administrador.
  await setDoc(doc(db, COUPONS, couponCode), {
    code: couponCode,
    percent: REVIEW_BONUS_PERCENT,
    expiresAt: null,
    usedAt: null,
    usedOrderId: null,
  });

  const created = await getDoc(ref);
  return toReviewRequest(created.id, created.data());
}

// Escucha en vivo todas las reseñas pedidas, para pintar el estado junto a
// cada pedido en /admin/pedidos sin tener que entrar pedido por pedido.
export function subscribeToReviewRequests(onChange: (byOrderId: Record<string, ReviewRequest>) => void): () => void {
  if (!db) return () => {};
  return onSnapshot(
    collection(db, REQUESTS),
    (snap) => {
      const map: Record<string, ReviewRequest> = {};
      snap.docs.forEach((d) => {
        const r = toReviewRequest(d.id, d.data());
        map[r.orderId] = r;
      });
      onChange(map);
    },
    () => {},
  );
}

// Lectura pública — la usa la página /resena/[orderId] que abre la clienta
// desde su link, sin ninguna sesión.
export async function getReviewRequest(orderId: string): Promise<ReviewRequest | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, REQUESTS, orderId));
  if (!snap.exists()) return null;
  return toReviewRequest(snap.id, snap.data());
}

interface SubmitReviewResult {
  couponCode: string;
  couponPercent: number;
  couponExpiresAt: number;
}

// La clienta envía su reseña — en ese momento se activa su bono por 15
// días (antes de dejar la reseña el cupón no sirve, aunque alguien
// adivinara el código).
export async function submitReview(
  orderId: string,
  input: { rating: number; text: string; photos: string[] },
): Promise<SubmitReviewResult> {
  if (!db) throw new Error('Firestore no está disponible.');
  const ref = doc(db, REQUESTS, orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('No encontramos ese pedido.');
  const data = snap.data();
  const couponCode = data.couponCode as string;
  const couponExpiresAt = Date.now() + REVIEW_BONUS_DAYS * 24 * 60 * 60 * 1000;

  await updateDoc(ref, {
    rating: input.rating,
    reviewText: input.text,
    reviewPhotos: input.photos,
    reviewSubmittedAt: serverTimestamp(),
    couponExpiresAt,
  });

  await updateDoc(doc(db, COUPONS, couponCode), { expiresAt: couponExpiresAt }).catch(() => {});

  return { couponCode, couponPercent: (data.couponPercent as number) ?? REVIEW_BONUS_PERCENT, couponExpiresAt };
}

interface ApplyResult {
  ok: boolean;
  percent?: number;
  expiresAt?: number;
  reason?: 'not_found' | 'not_active' | 'expired' | 'used';
}

// Se llama al entrar por el link con "?cupon=CODIGO" — valida el código
// contra la copia pública y, si sirve, lo deja guardado como el cupón
// activo (mismo mecanismo que la ruleta) para que el checkout lo aplique solo.
export async function applyRewardCoupon(code: string): Promise<ApplyResult> {
  if (!db || !code) return { ok: false, reason: 'not_found' };
  const snap = await getDoc(doc(db, COUPONS, code));
  if (!snap.exists()) return { ok: false, reason: 'not_found' };
  const data = snap.data();
  if (data.usedAt) return { ok: false, reason: 'used' };
  if (!data.expiresAt) return { ok: false, reason: 'not_active' };
  if (data.expiresAt < Date.now()) return { ok: false, reason: 'expired' };

  saveWonCoupon(code, data.percent, data.expiresAt);
  return { ok: true, percent: data.percent, expiresAt: data.expiresAt };
}

// Se llama justo después de crear un pedido en el checkout — si el cupón
// usado es uno de bono de reseña, lo marca como gastado para que no se
// pueda volver a aplicar. Si el código no existe ahí (ej. un cupón normal
// de la ruleta), simplemente no hace nada.
export async function markRewardCouponUsed(code: string, orderId: string): Promise<void> {
  if (!db || !code) return;
  try {
    const ref = doc(db, COUPONS, code);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await updateDoc(ref, { usedAt: serverTimestamp(), usedOrderId: orderId });
  } catch {
    // Nunca debe afectar la compra real si esto falla.
  }
}
