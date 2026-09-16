import { NextResponse } from 'next/server';

// Confirma en el servidor, contra la propia API de Wompi, si una transacción
// realmente quedó aprobada — así la página de confirmación no depende solo
// de que el navegador haya vuelto redirigido (eso puede pasar aunque el
// pago haya sido rechazado o quedado pendiente).
export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: 'Wompi no está configurado.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const transactionId = body?.transactionId;
  if (!transactionId) {
    return NextResponse.json({ error: 'Falta transactionId.' }, { status: 400 });
  }

  const apiBase = publicKey.startsWith('pub_test_') ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

  try {
    const res = await fetch(`${apiBase}/transactions/${transactionId}`, {
      headers: privateKey ? { Authorization: `Bearer ${privateKey}` } : undefined,
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'No se pudo verificar el pago con Wompi.' }, { status: 502 });
    }
    const data = await res.json();
    const tx = data?.data;
    return NextResponse.json({
      status: tx?.status ?? 'ERROR',
      reference: tx?.reference ?? null,
      amountInCents: tx?.amount_in_cents ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo contactar a Wompi.' }, { status: 502 });
  }
}
