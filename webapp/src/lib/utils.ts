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

// Hora relativa tipo WhatsApp para la bandeja del CRM ("Ahora", "5 min",
// "2 h", "Ayer", o la fecha corta si ya pasó más de una semana).
export function formatRelativeTime(ms: number): string {
  if (!ms) return '';
  const diff = Date.now() - ms;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'Ahora';
  if (diff < hour) return `${Math.floor(diff / minute)} min`;
  if (diff < day) return `${Math.floor(diff / hour)} h`;
  if (diff < 2 * day) return 'Ayer';
  if (diff < 7 * day) return `${Math.floor(diff / day)} d`;
  return new Date(ms).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
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

// Frase fija que se agrega a TODOS los mensajes que salen de un botón de
// WhatsApp de la tienda — así, al verla en el chat, queda claro que esa
// clienta llegó desde la página web (no de una referencia personal, de
// Instagram directo, etc.). El webhook de Meta (api/whatsapp/webhook)
// busca esta misma frase textual en el primer mensaje para etiquetar al
// contacto como "🌐 Web" solo en el CRM — nunca se cambia sin actualizar
// también esa búsqueda.
export const WEB_ORIGIN_TAG = 'Vengo desde tu página web';

export function withWebOrigin(message: string): string {
  return `${message}\n\n🌐 ${WEB_ORIGIN_TAG}`;
}

// URL completa de la ficha de un producto — al incluirla dentro de un
// mensaje de WhatsApp, la app genera sola una vista previa con la foto y el
// nombre del producto (igual que al compartir cualquier link), sin
// necesidad de adjuntar un archivo real: WhatsApp no deja adjuntar fotos
// desde un link wa.me, pero sí arma esta tarjeta automáticamente. Si se
// pasa un color, la ficha arma la vista previa con la foto de ESE color en
// vez de siempre la primera foto del producto (ver generateMetadata en
// producto/[slug]/page.tsx).
export function absoluteProductUrl(slug: string, color?: string): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com').replace(/\/$/, '');
  const query = color ? `?color=${encodeURIComponent(color)}` : '';
  return `${siteUrl}/producto/${slug}${query}`;
}

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
// formulario del checkout, en lugar de simplemente perderlas. Incluye el
// link del primer producto para que WhatsApp arme una vista previa con foto
// (con varios productos solo se previsualiza el primero — es una limitación
// de WhatsApp, no se puede elegir cuál).
export function buildCartWhatsAppMessage(
  items: { title: string; slug?: string; size: string; color: string; quantity: number }[],
): string {
  const lines = items.map((i) => `- ${i.title} (talla ${i.size}, ${i.color}) x${i.quantity}`).join('\n');
  const link = items[0]?.slug ? `\n${absoluteProductUrl(items[0].slug, items[0].color)}` : '';
  return withWebOrigin(`Hola! Quiero terminar mi compra:\n\n${lines}\n\n¿Me ayudan a confirmar el pedido?${link}`);
}

// Mensaje de WhatsApp con el resumen completo de un pedido YA CONFIRMADO —
// se usa tanto para llevar automáticamente a la clienta a WhatsApp cuando
// elige pago contra entrega, como en el botón de respaldo de la página de
// confirmación. Formato tipo factura, profesional, listo para enviar tal cual.
export function buildOrderWhatsAppMessage(order: {
  orderNumber: string;
  items: { title: string; slug?: string; size: string; color: string; quantity: number; price: number }[];
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

  return withWebOrigin(`✅ *Pedido confirmado* — ${order.orderNumber}

📦 *Productos:*
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

¿Me confirman que quedó todo listo? ¡Gracias! 😊${
    order.items[0]?.slug ? `\n${absoluteProductUrl(order.items[0].slug, order.items[0].color)}` : ''
  }`);
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

// Pide a Cloudinary un recorte a cuadrado con IA (detecta en qué parte de
// la foto está el producto y encuadra ahí) al TAMAÑO en que se va a mostrar
// — a diferencia de recortar al subir, esto no borra nada de la foto
// original: solo afecta cómo se sirve esta copia en particular, así que la
// foto se puede mostrar completa (sin este recorte) en otro lugar sin
// perder calidad. No hace nada si la URL no es de Cloudinary.
export function cloudinaryFill(url: string, size: number): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/c_fill,g_auto,w_${size},h_${size},q_auto,f_auto/`);
}

// Recupera la foto ORIGINAL sin recortar, incluso para fotos subidas antes
// de este cambio (cuando el recorte a cuadrado se guardaba para siempre en
// la URL) — el archivo real en Cloudinary nunca se tocó, solo se le pedía
// una versión recortada, así que basta con quitar esa transformación de la
// URL para volver a ver la foto completa. Se usa cuando una foto se marca
// como "Completa" en el admin, sin importar cuándo se subió.
export function cloudinaryOriginal(url: string): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace(/\/upload\/(?:[a-z]+_[^/,]+,)*[a-z]+_[^/]+\//, '/upload/');
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
