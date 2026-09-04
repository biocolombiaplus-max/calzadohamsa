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
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export function whatsappLink(message: string): string {
  const phone = `${WA_COUNTRY}${WA_NUMBER}`.replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function whatsappLinkTo(phone: string, message: string, countryCode = WA_COUNTRY): string {
  const digits = phone.replace(/\D/g, '');
  const fullNumber = digits.startsWith(countryCode) ? digits : `${countryCode}${digits}`;
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
