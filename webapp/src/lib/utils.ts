// Determina qué foto mostrar para el color elegido: si el admin le asignó
// una foto específica a ese color, se usa esa. Si no, se muestra la foto
// principal del producto en vez de adivinar por posición — adivinar por
// orden de subida mostraba fotos de OTRO color cuando las fotos no se
// subieron en el mismo orden que los colores (ej: elegir "Negro" y que
// aparezca la foto café), que es peor que simplemente no cambiar la foto.
export function resolveColorImage(
  product: { colors: { name: string; image?: string }[]; images: string[] },
  colorName: string,
): string | undefined {
  const color = product.colors.find((c) => c.name === colorName);
  if (!color) return undefined;
  return color.image || product.images[0];
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const WA_COUNTRY = process.env.NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE || '57';

/**
 * Construye un enlace wa.me válido a partir de un número escrito de cualquier
 * forma (con espacios, guiones, +, ceros iniciales, con o sin el código de
 * país ya incluido) y un código de país. Nunca duplica el código de país ni
 * lo deja puesto dos veces.
 */
export function whatsappLinkTo(phone: string, message: string, countryCode?: string): string {
  const cc = (countryCode || WA_COUNTRY).replace(/\D/g, '');
  const digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  const fullNumber = cc && !digits.startsWith(cc) ? `${cc}${digits}` : digits;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

// Mensaje de WhatsApp con el detalle del carrito — pensado para clientas que
// prefieren terminar la compra hablando con alguien en vez de llenar el
// formulario del checkout, en lugar de simplemente perderlas.
export function buildCartWhatsAppMessage(items: { title: string; size: string; color: string; quantity: number }[]): string {
  const lines = items.map((i) => `- ${i.title} (talla ${i.size}, ${i.color}) x${i.quantity}`).join('\n');
  return `Hola! Quiero terminar mi compra:\n\n${lines}\n\n¿Me ayudan a confirmar el pedido?`;
}

// Mensaje de WhatsApp con el resumen completo de un pedido YA CONFIRMADO —
// se usa tanto para llevar automáticamente a la clienta a WhatsApp cuando
// elige pago contra entrega, como en el botón de respaldo de la página de
// confirmación. Formato tipo factura, profesional, listo para enviar tal cual.
export function buildOrderWhatsAppMessage(order: {
  orderNumber: string;
  items: { title: string; size: string; color: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'contra_entrega' | 'transferencia' | 'wompi';
  customer: { name: string; phone: string; address: string; city: string; department: string; locationUrl?: string };
}): string {
  const itemsList = order.items
    .map((i) => `- ${i.title} (talla ${i.size}, ${i.color}) x${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join('\n');
  const paymentLabel =
    order.paymentMethod === 'contra_entrega'
      ? '💵 Pago contra entrega'
      : order.paymentMethod === 'wompi'
        ? '⚡ Pagado en línea'
        : '🏦 Transferencia bancaria';

  return `✅ *Pedido confirmado* — ${order.orderNumber}

🛍️ *Productos:*
${itemsList}

💰 Subtotal: ${formatPrice(order.subtotal)}
🚚 Envío: ${order.shipping === 0 ? 'GRATIS' : formatPrice(order.shipping)}
*Total: ${formatPrice(order.total)}*

${paymentLabel}

📍 *Datos de entrega:*
${order.customer.name}
📱 ${order.customer.phone}
${order.customer.address}, ${order.customer.city}, ${order.customer.department}${
    order.customer.locationUrl ? `\n📍 Ubicación: ${order.customer.locationUrl}` : ''
  }

¿Me confirman que quedó todo listo? ¡Gracias! 😊`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate(),
  ).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HS-${stamp}-${random}`;
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

// Firestore rechaza addDoc()/updateDoc() si algún campo (a cualquier
// profundidad, incluso dentro de arreglos como `colors`) queda en
// `undefined` — hay que quitar esas llaves del todo antes de guardar.
// Aplícalo solo sobre datos planos (no sobre el objeto ya armado con
// serverTimestamp(), que es un valor especial de Firestore y no debe
// reconstruirse como objeto plano).
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) result[key] = stripUndefined(val);
    }
    return result as T;
  }
  return value;
}

export function hexToRgbChannels(hex: string): string {
  const clean = hex.replace('#', '').trim();
  const normalized = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const bigint = parseInt(normalized, 16);
  if (normalized.length !== 6 || Number.isNaN(bigint)) return '0 0 0';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}
