const STORAGE_KEY = 'hamsa-coupon';
const VALID_HOURS = 24;

export interface WonCoupon {
  code: string;
  percent: number;
  expiresAt: number;
}

export function saveWonCoupon(code: string, percent: number): void {
  if (typeof window === 'undefined') return;
  const coupon: WonCoupon = { code, percent, expiresAt: Date.now() + VALID_HOURS * 60 * 60 * 1000 };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupon));
  } catch {
    // Almacenamiento no disponible (modo privado, etc.) — el cupón simplemente no persiste.
  }
}

export function getActiveCoupon(): WonCoupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const coupon = JSON.parse(raw) as WonCoupon;
    if (!coupon?.code || !coupon.percent || coupon.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return coupon;
  } catch {
    return null;
  }
}

export function clearCoupon(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
}
