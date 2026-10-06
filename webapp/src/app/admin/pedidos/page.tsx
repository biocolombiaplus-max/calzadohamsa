'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllOrders, updateOrderStatus, updateOrderShipping, updateOrderShippingLabel, deleteOrder } from '@/lib/orders';
import { getSiteSettings } from '@/lib/settings';
import { uploadShippingLabel } from '@/lib/storage';
import { sendReviewRequest, subscribeToReviewRequests } from '@/lib/reviews';
import { CARRIERS, type Order, type OrderStatus, type Carrier, type ReviewRequest } from '@/lib/types';
import { formatPrice, whatsappLinkTo } from '@/lib/utils';

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|heic)(\?|$)/i;

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const PAYMENT_LABELS: Record<Order['paymentMethod'], string> = {
  contra_entrega: '💵 Contra entrega',
  transferencia: '🏦 Transferencia',
  wompi: '⚡ Wompi (en línea)',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-urgent/10 text-urgent',
  confirmado: 'bg-primary-light/20 text-primary-hover',
  enviado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-border text-muted',
};

function bonusStatusLabel(r: ReviewRequest): string {
  if (r.couponUsedAt) return `🎟️ Bono usado`;
  if (r.couponExpiresAt && r.couponExpiresAt < Date.now()) return '🎟️ Bono vencido';
  if (r.couponExpiresAt) {
    const date = new Date(r.couponExpiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    return `🎟️ Bono activo hasta ${date}`;
  }
  return '';
}

function classNamesForBonus(r: ReviewRequest): string {
  const base = 'rounded-full px-2.5 py-1 text-xs font-semibold';
  if (r.couponUsedAt) return `${base} bg-cream-alt text-muted`;
  if (r.couponExpiresAt && r.couponExpiresAt < Date.now()) return `${base} bg-urgent/10 text-urgent`;
  return `${base} bg-primary-light/20 text-primary-hover`;
}

function buildStatusMessage(order: Order, storeName: string): string {
  const firstName = order.customer.name.split(' ')[0];
  switch (order.status) {
    case 'confirmado':
      return `Hola ${firstName}! Tu pedido ${order.orderNumber} en ${storeName} fue confirmado y ya lo estamos alistando. Te avisamos apenas salga hacia ${order.customer.city}. ¡Gracias por tu compra!`;
    case 'enviado': {
      const shippingInfo =
        order.carrier && order.trackingNumber
          ? `\n\nTransportadora: ${order.carrier}\nNúmero de guía: ${order.trackingNumber}`
          : '';
      // wa.me (el link de "clic para chatear") no permite adjuntar un
      // archivo de verdad — solo texto. Por eso se manda como un link
      // dentro del mensaje: al tocarlo la clienta ve/descarga la foto o el
      // PDF igual, y en la mayoría de los casos WhatsApp muestra una
      // vista previa de la imagen directo en el chat.
      const labelInfo = order.shippingLabelUrl ? `\n📎 Foto de la guía: ${order.shippingLabelUrl}` : '';
      return `Hola ${firstName}! Tu pedido ${order.orderNumber} ya salió hacia ${order.customer.city}.${shippingInfo}${labelInfo}\n\nCualquier novedad con la entrega, escríbenos por este mismo medio.`;
    }
    case 'entregado':
      return `Hola ${firstName}! Vimos que tu pedido ${order.orderNumber} ya fue entregado. Esperamos que te encanten tus sandalias 💛 Si necesitas cambio de talla o tienes alguna duda, aquí estamos.`;
    case 'cancelado':
      return `Hola ${firstName}, tu pedido ${order.orderNumber} en ${storeName} fue cancelado. Si fue un error o quieres hacer un nuevo pedido, escríbenos y con gusto te ayudamos.`;
    default:
      return `Hola ${firstName}, te escribimos de ${storeName} por tu pedido ${order.orderNumber}. ¿Confirmamos los datos de tu envío?`;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [storeName, setStoreName] = useState('la tienda');
  const [savingShipping, setSavingShipping] = useState<string | null>(null);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);
  const [labelErrors, setLabelErrors] = useState<Record<string, string>>({});
  const [reviewRequests, setReviewRequests] = useState<Record<string, ReviewRequest>>({});
  const [sendingReview, setSendingReview] = useState<string | null>(null);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
    getSiteSettings()
      .then((s) => setStoreName(s.storeName))
      .catch(() => {});
    return subscribeToReviewRequests(setReviewRequests);
  }, []);

  function buildReviewMessage(order: Order, link: string): string {
    const firstName = order.customer.name.split(' ')[0];
    return `Hola ${firstName}! Gracias por tu compra en ${storeName} 💛 Nos encantaría conocer tu opinión — déjanos tu reseña aquí (toma 1 minuto) y te regalamos un bono del 10% para tu próxima compra:\n\n${link}`;
  }

  // Crea (o reenvía) el link de reseña + bono de esa clienta y abre
  // WhatsApp con el mensaje ya listo para mandárselo. La pestaña de
  // WhatsApp se abre EN BLANCO ya mismo (todavía dentro del clic) y se le
  // pone la URL real después — si se espera a que termine de guardar en la
  // base de datos primero, el navegador bloquea la ventana por considerarla
  // un pop-up, y el botón parece no hacer nada (el mismo truco que ya se
  // usa al avisar un pedido por WhatsApp en el checkout).
  async function handleSendReview(order: Order) {
    setSendingReview(order.id);
    const waWindow = window.open('', '_blank');
    try {
      await sendReviewRequest(order);
      const link = `${window.location.origin}/resena/${order.id}`;
      const url = whatsappLinkTo(order.customer.phone, buildReviewMessage(order, link));
      if (waWindow) waWindow.location.href = url;
      else window.open(url, '_blank');
    } catch {
      waWindow?.close();
    } finally {
      setSendingReview(null);
    }
  }

  // Respaldo por si el envío directo a WhatsApp falla por cualquier razón
  // (red lenta, navegador raro, etc.) — copia el link para pegarlo donde
  // sea: WhatsApp Web, SMS, Instagram...
  function handleCopyReviewLink(orderId: string) {
    const link = `${window.location.origin}/resena/${orderId}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedReviewId(orderId);
      setTimeout(() => setCopiedReviewId((c) => (c === orderId ? null : c)), 2000);
    });
  }

  async function handleStatusChange(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status);
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
  }

  async function handleShippingSave(order: Order, carrier: Carrier | '', trackingNumber: string) {
    setSavingShipping(order.id);
    try {
      await updateOrderShipping(order.id, { carrier: carrier || undefined, trackingNumber });
      setOrders((prev) =>
        prev
          ? prev.map((o) => (o.id === order.id ? { ...o, carrier: carrier || undefined, trackingNumber } : o))
          : prev,
      );
    } finally {
      setSavingShipping(null);
    }
  }

  // Sube la foto/PDF de la guía en cuanto se elige el archivo (sin botón
  // aparte de "guardar") y la deja lista para ir dentro del mensaje de
  // WhatsApp — así queda "rápido y fácil" como se pidió.
  async function handleLabelUpload(order: Order, file: File) {
    setUploadingLabel(order.id);
    setLabelErrors((prev) => ({ ...prev, [order.id]: '' }));
    try {
      const url = await uploadShippingLabel(file);
      await updateOrderShippingLabel(order.id, url);
      setOrders((prev) => (prev ? prev.map((o) => (o.id === order.id ? { ...o, shippingLabelUrl: url } : o)) : prev));
    } catch (err) {
      setLabelErrors((prev) => ({
        ...prev,
        [order.id]: err instanceof Error ? err.message : 'No se pudo subir el archivo.',
      }));
    } finally {
      setUploadingLabel(null);
    }
  }

  async function handleLabelRemove(order: Order) {
    await updateOrderShippingLabel(order.id, null);
    setOrders((prev) => (prev ? prev.map((o) => (o.id === order.id ? { ...o, shippingLabelUrl: undefined } : o)) : prev));
  }

  async function handleDeleteOrder(order: Order) {
    if (!confirm(`¿Eliminar el pedido ${order.orderNumber}? Esta acción no se puede deshacer.`)) return;
    await deleteOrder(order.id);
    setOrders((prev) => (prev ? prev.filter((o) => o.id !== order.id) : prev));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-muted">Gestiona el estado, el envío y el seguimiento de cada pedido</p>
        </div>
        <Link href="/admin/pedidos/nuevo" className="btn-primary shrink-0 text-sm">
          + Nuevo pedido
        </Link>
      </div>

      <div className="space-y-4">
        {orders === null ? (
          <p className="text-muted">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-card bg-white p-6 text-center text-muted shadow-soft">Todavía no hay pedidos.</p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              storeName={storeName}
              saving={savingShipping === order.id}
              uploadingLabel={uploadingLabel === order.id}
              labelError={labelErrors[order.id]}
              reviewRequest={reviewRequests[order.id]}
              sendingReview={sendingReview === order.id}
              reviewLinkCopied={copiedReviewId === order.id}
              onStatusChange={(status) => handleStatusChange(order.id, status)}
              onShippingSave={(carrier, trackingNumber) => handleShippingSave(order, carrier, trackingNumber)}
              onLabelUpload={(file) => handleLabelUpload(order, file)}
              onLabelRemove={() => handleLabelRemove(order)}
              onDelete={() => handleDeleteOrder(order)}
              onSendReview={() => handleSendReview(order)}
              onCopyReviewLink={() => handleCopyReviewLink(order.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  storeName,
  saving,
  uploadingLabel,
  labelError,
  reviewRequest,
  sendingReview,
  reviewLinkCopied,
  onStatusChange,
  onShippingSave,
  onLabelUpload,
  onLabelRemove,
  onDelete,
  onSendReview,
  onCopyReviewLink,
}: {
  order: Order;
  storeName: string;
  saving: boolean;
  uploadingLabel: boolean;
  labelError?: string;
  reviewRequest?: ReviewRequest;
  sendingReview: boolean;
  reviewLinkCopied: boolean;
  onStatusChange: (status: OrderStatus) => void;
  onShippingSave: (carrier: Carrier | '', trackingNumber: string) => void;
  onLabelUpload: (file: File) => void;
  onLabelRemove: () => void;
  onDelete: () => void;
  onSendReview: () => void;
  onCopyReviewLink: () => void;
}) {
  const [carrier, setCarrier] = useState<Carrier | ''>(order.carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const shippingChanged = carrier !== (order.carrier ?? '') || trackingNumber !== (order.trackingNumber ?? '');

  return (
    <div className="rounded-card bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">{order.orderNumber}</p>
          <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
            className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-semibold text-muted hover:text-urgent"
          >
            🗑️ Eliminar pedido
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted">Cliente</p>
          <p className="text-sm text-ink">{order.customer.name}</p>
          <p className="text-sm text-muted">{order.customer.phone}</p>
          <p className="text-sm text-muted">
            {order.customer.address}, {order.customer.city}, {order.customer.department}
          </p>
          {order.customer.locationUrl && (
            <a
              href={order.customer.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
            >
              📍 Ver ubicación confirmada
            </a>
          )}
          {order.customer.note && (
            <p className="mt-1 text-xs italic text-muted">&ldquo;{order.customer.note}&rdquo;</p>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted">Productos</p>
          <ul className="space-y-1 text-sm text-ink">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.title} (T.{item.size}, {item.color}) × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-bold uppercase text-muted">Envío</p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted">Transportadora</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as Carrier | '')}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Sin asignar</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Número de guía</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ej: 123456789"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          {shippingChanged && (
            <button
              onClick={() => onShippingSave(carrier, trackingNumber)}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar guía'}
            </button>
          )}
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-muted">📎 Foto o PDF de la guía</label>
          {order.shippingLabelUrl ? (
            <div className="flex items-center gap-2">
              {IMAGE_EXTENSION.test(order.shippingLabelUrl) ? (
                <a
                  href={order.shippingLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-cream-alt"
                >
                  <Image src={order.shippingLabelUrl} alt="Guía de envío" fill className="object-cover" />
                </a>
              ) : (
                <a
                  href={order.shippingLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-cream-alt text-2xl"
                >
                  📄
                </a>
              )}
              <div>
                <a
                  href={order.shippingLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-semibold text-primary hover:underline"
                >
                  Ver archivo ↗
                </a>
                <button type="button" onClick={onLabelRemove} className="text-xs text-urgent hover:underline">
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-3 py-2 text-xs text-muted hover:border-primary">
              {uploadingLabel ? 'Subiendo...' : '+ Subir guía (foto o PDF)'}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={uploadingLabel}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLabelUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          )}
          {labelError && <p className="mt-1 text-xs text-urgent">{labelError}</p>}
          {order.shippingLabelUrl && (
            <p className="mt-1 text-xs text-muted">Se incluye como link en el mensaje de WhatsApp al avisar &ldquo;Enviado&rdquo;.</p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-bold uppercase text-muted">Reseña y bono de fidelización</p>
        {!reviewRequest ? (
          <button
            type="button"
            onClick={onSendReview}
            disabled={sendingReview}
            className="rounded-lg bg-primary-light/20 px-3.5 py-2 text-sm font-semibold text-primary-hover hover:bg-primary-light/30 disabled:opacity-60"
          >
            {sendingReview ? 'Enviando...' : '🎁 Enviar reseña y bono'}
          </button>
        ) : !reviewRequest.reviewSubmittedAt ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              📨 Link enviado · esperando reseña
            </span>
            <button type="button" onClick={onSendReview} disabled={sendingReview} className="text-xs font-semibold text-primary hover:underline">
              Reenviar
            </button>
            <button type="button" onClick={onCopyReviewLink} className="text-xs font-semibold text-primary hover:underline">
              {reviewLinkCopied ? '✓ Link copiado' : '📋 Copiar link'}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                ⭐ {reviewRequest.rating} · Reseña dejada
              </span>
              {!!reviewRequest.reviewPhotos?.length && (
                <span className="text-xs text-muted">📷 {reviewRequest.reviewPhotos.length} foto(s)</span>
              )}
              <span
                className={classNamesForBonus(reviewRequest)}
              >
                {bonusStatusLabel(reviewRequest)}
              </span>
              <button type="button" onClick={onCopyReviewLink} className="text-xs font-semibold text-primary hover:underline">
                {reviewLinkCopied ? '✓ Link copiado' : '📋 Copiar link'}
              </button>
            </div>
            {reviewRequest.reviewText && <p className="text-xs italic text-muted">&ldquo;{reviewRequest.reviewText}&rdquo;</p>}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="text-sm">
          <span className="text-muted">Subtotal: </span>
          <span className="font-semibold text-ink">{formatPrice(order.subtotal)}</span>
          <span className="ml-3 text-muted">Envío: </span>
          <span className="font-semibold text-ink">
            {order.shipping > 0 ? formatPrice(order.shipping) : 'GRATIS'}
          </span>
          <span className="ml-3 text-muted">Total: </span>
          <span className="font-bold text-primary">{formatPrice(order.total)}</span>
          <span className="ml-3 text-muted">{PAYMENT_LABELS[order.paymentMethod]}</span>
          {order.paymentReference && (
            <span className="ml-3 text-xs text-muted">Ref: {order.paymentReference}</span>
          )}
          {order.couponCode && (
            <span className="ml-3 text-xs font-semibold text-primary">🎟️ Cupón: {order.couponCode}</span>
          )}
        </div>
        <a
          href={whatsappLinkTo(order.customer.phone, buildStatusMessage(order, storeName))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          💬 Avisar por WhatsApp ({STATUSES.find((s) => s.value === order.status)?.label})
        </a>
      </div>
    </div>
  );
}
