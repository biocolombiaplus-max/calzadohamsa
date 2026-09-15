import { collection, doc, getDoc, getDocs, addDoc, updateDoc, orderBy, query, limit, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Carrier, CartItem, Order, OrderCustomer, OrderInput, OrderStatus, PaymentMethod } from './types';
import { generateOrderNumber, stripUndefined } from './utils';

const COLLECTION = 'orders';

function toOrder(id: string, data: any): Order {
  return {
    id,
    orderNumber: data.orderNumber,
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    shipping: data.shipping ?? 0,
    total: data.total ?? 0,
    customer: data.customer,
    paymentMethod: data.paymentMethod,
    status: data.status ?? 'pendiente',
    carrier: data.carrier || undefined,
    trackingNumber: data.trackingNumber || undefined,
    paymentReference: data.paymentReference || undefined,
    couponCode: data.couponCode || undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
  };
}

export async function createOrder(input: OrderInput): Promise<{ id: string; orderNumber: string }> {
  const orderNumber = generateOrderNumber();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...stripUndefined(input),
    orderNumber,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, orderNumber };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data());
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status });
}

// Escucha en vivo los pedidos nuevos que van llegando mientras el admin
// tiene el panel abierto (para la campanita de aviso) — ignora la primera
// tanda de resultados (los pedidos ya existentes) y solo notifica los que
// se crean después de empezar a escuchar.
export function subscribeToNewOrders(onNewOrder: (order: Order) => void): () => void {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(15));
  let isFirstSnapshot = true;
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          onNewOrder(toOrder(change.doc.id, change.doc.data()));
        }
      });
    },
    () => {},
  );
  return unsubscribe;
}

// Avisa por correo a la tienda que llegó un pedido nuevo — igual que la
// notificación automática de Shopify. Nunca debe romper el checkout: si no
// hay correo configurado o el envío falla, simplemente no pasa nada.
export function notifyOrderByEmail(payload: {
  to: string;
  storeName: string;
  accentColor?: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  customer: OrderCustomer;
}): void {
  if (!payload.to) return;
  fetch('/api/notify-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function updateOrderShipping(
  id: string,
  shipping: { carrier?: Carrier; trackingNumber?: string },
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    carrier: shipping.carrier ?? '',
    trackingNumber: shipping.trackingNumber ?? '',
  });
}
