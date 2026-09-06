import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

// Esta ruta corre en el servidor (nunca en el navegador). La "llave de
// integridad" de Wompi es secreta: si se calculara la firma en el cliente,
// cualquiera podría alterar el monto a pagar. Aquí se calcula de forma
// segura y solo se devuelve el hash resultante.
export async function POST(request: Request) {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Wompi no está configurado (falta WOMPI_INTEGRITY_SECRET en el servidor).' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const { reference, amountInCents, currency } = body ?? {};

  if (!reference || !amountInCents || !currency) {
    return NextResponse.json({ error: 'Faltan datos: reference, amountInCents o currency.' }, { status: 400 });
  }

  const signature = createHash('sha256').update(`${reference}${amountInCents}${currency}${secret}`).digest('hex');

  return NextResponse.json({ signature });
}
