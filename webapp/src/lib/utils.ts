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
