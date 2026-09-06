const PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

export function isWompiConfigured(): boolean {
  return !!PUBLIC_KEY;
}

export interface WompiCheckoutParams {
  amountInCents: number;
  reference: string;
  redirectUrl: string;
  customerEmail?: string;
  customerFullName?: string;
  customerPhone?: string;
}

/**
 * Redirige al cliente al Checkout Web de Wompi ya firmado. La firma de
 * integridad se calcula en el servidor (ver /api/wompi-signature) para no
 * exponer la llave secreta en el navegador.
 */
export async function redirectToWompiCheckout(params: WompiCheckoutParams): Promise<void> {
  if (!PUBLIC_KEY) {
    throw new Error(
      'Wompi no está configurado todavía. Agrega NEXT_PUBLIC_WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET (ver README.md).',
    );
  }

  const currency = 'COP';
  const res = await fetch('/api/wompi-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference: params.reference, amountInCents: params.amountInCents, currency }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'No se pudo iniciar el pago con Wompi.');
  }

  const { signature } = (await res.json()) as { signature: string };

  const url = new URL('https://checkout.wompi.co/p/');
  url.searchParams.set('public-key', PUBLIC_KEY);
  url.searchParams.set('currency', currency);
  url.searchParams.set('amount-in-cents', String(params.amountInCents));
  url.searchParams.set('reference', params.reference);
  url.searchParams.set('signature:integrity', signature);
  url.searchParams.set('redirect-url', params.redirectUrl);
  if (params.customerEmail) url.searchParams.set('customer-data:email', params.customerEmail);
  if (params.customerFullName) url.searchParams.set('customer-data:full-name', params.customerFullName);
  if (params.customerPhone) url.searchParams.set('customer-data:phone-number', params.customerPhone);

  window.location.href = url.toString();
}

export function generatePaymentReference(prefix = 'HAMSA'): string {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
