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

// Mensaje genérico y amable para la clienta — el motivo técnico real (falta
// una llave en el servidor, Wompi no respondió, etc.) queda en la consola
// para poder diagnosticarlo, pero nunca se le muestra tal cual a quien está
// comprando.
const WOMPI_CUSTOMER_ERROR =
  'No pudimos conectar con el pago en línea en este momento. Prueba con "Pago contra entrega" o escríbenos por WhatsApp.';

/**
 * Pide al servidor la firma de integridad para una transacción (ver
 * /api/wompi-signature) — se llama ANTES de crear el pedido o avisar a la
 * administradora, para que un problema de configuración de Wompi (o una
 * caída puntual) nunca termine creando un pedido "fantasma" que nadie pagó
 * ni mandando una alerta de pedido nuevo en falso.
 */
export async function getWompiSignature(reference: string, amountInCents: number): Promise<string> {
  if (!PUBLIC_KEY) throw new Error(WOMPI_CUSTOMER_ERROR);

  try {
    const res = await fetch('/api/wompi-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amountInCents, currency: 'COP' }),
    });
    if (!res.ok) {
      console.error('[wompi] /api/wompi-signature respondió', res.status, await res.text().catch(() => ''));
      throw new Error(WOMPI_CUSTOMER_ERROR);
    }
    const { signature } = (await res.json()) as { signature: string };
    return signature;
  } catch (error) {
    if (error instanceof Error && error.message === WOMPI_CUSTOMER_ERROR) throw error;
    console.error('[wompi] Error pidiendo la firma.', error);
    throw new Error(WOMPI_CUSTOMER_ERROR);
  }
}

// Arma la URL del Checkout Web de Wompi — pura, no hace red ni puede
// fallar, para usarse solo DESPUÉS de que el pedido ya quedó creado.
export function wompiCheckoutUrl(params: WompiCheckoutParams & { signature: string }): string {
  const currency = 'COP';

  // Wompi agrega su propio "?id=<transacción>" a esta URL al volver — se le
  // suman también la referencia y el monto que nosotros generamos, para que
  // la página de confirmación pueda verificar el pago contra la transacción
  // real (ver /api/wompi-verify) sin depender de leer nada más.
  const redirectUrl = new URL(params.redirectUrl);
  redirectUrl.searchParams.set('wompi_ref', params.reference);
  redirectUrl.searchParams.set('wompi_amt', String(params.amountInCents));

  const url = new URL('https://checkout.wompi.co/p/');
  url.searchParams.set('public-key', PUBLIC_KEY ?? '');
  url.searchParams.set('currency', currency);
  url.searchParams.set('amount-in-cents', String(params.amountInCents));
  url.searchParams.set('reference', params.reference);
  url.searchParams.set('signature:integrity', params.signature);
  url.searchParams.set('redirect-url', redirectUrl.toString());
  if (params.customerEmail) url.searchParams.set('customer-data:email', params.customerEmail);
  if (params.customerFullName) url.searchParams.set('customer-data:full-name', params.customerFullName);
  if (params.customerPhone) url.searchParams.set('customer-data:phone-number', params.customerPhone);

  return url.toString();
}

export function generatePaymentReference(prefix = 'HAMSA'): string {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
