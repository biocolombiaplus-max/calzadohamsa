'use client';

// Todo este archivo es de NAVEGADOR (usa window.fbq y cookies) — se usa
// desde los componentes que disparan eventos de Meta Pixel (ver producto,
// agregar al carrito, iniciar compra, compra completada). Si el Pixel no
// está configurado (falta NEXT_PUBLIC_META_PIXEL_ID), window.fbq nunca
// existe y todas las funciones de aquí simplemente no hacen nada — el
// resto del sitio sigue funcionando normal.

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
  }
}

export function trackPixelEvent(eventName: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', eventName, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('track', eventName, params ?? {});
  }
}

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Envía el mismo evento también al servidor (API de Conversiones de Meta),
// que llega aunque el navegador de la clienta bloquee el pixel (Safari,
// iPhone, bloqueadores de anuncios) — usa el mismo eventId que el pixel del
// navegador para que Meta los reconozca como el mismo evento y no lo
// cuente doble.
function trackServerEvent(payload: {
  eventName: string;
  eventId: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  phone?: string;
}): void {
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }),
  }).catch(() => {});
}

// El evento de Compra es el más importante para que Meta optimice bien la
// campaña — por eso es el único que además de fbq() en el navegador se
// manda también desde el servidor, y se protege con sessionStorage para
// no contarlo dos veces si la clienta recarga la página de confirmación.
export function trackPurchaseOnce(order: {
  id: string;
  total: number;
  items: { productId: string; quantity: number }[];
  customer: { phone: string };
}): void {
  if (typeof window === 'undefined') return;
  const key = `hamsa_fb_purchase_${order.id}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const contentIds = order.items.map((i) => i.productId);
  const numItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  trackPixelEvent(
    'Purchase',
    { value: order.total, currency: 'COP', content_ids: contentIds, content_type: 'product', num_items: numItems },
    order.id,
  );
  trackServerEvent({
    eventName: 'Purchase',
    eventId: order.id,
    value: order.total,
    currency: 'COP',
    contentIds,
    phone: order.customer.phone,
  });
}
