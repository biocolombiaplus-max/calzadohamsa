import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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
  const orderId = typeof body?.orderId === 'string' ? body.orderId : null;
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
    const status = tx?.status ?? 'ERROR';
    const reference = tx?.reference ?? null;

    // El pedido se crea como "pendiente" (las reglas de Firestore solo
    // dejan que lo cree el propio navegador de la clienta, sin sesión de
    // admin) — solo aquí, en el servidor con la cuenta de servicio, una vez
    // Wompi confirma el pago, se pasa a "confirmado". Se compara la
    // referencia para no tocar un pedido que no corresponde a esta
    // transacción.
    if (orderId && status === 'APPROVED' && adminDb) {
      try {
        const ref = adminDb.collection('orders').doc(orderId);
        const snap = await ref.get();
        const order = snap.data();
        if (order && order.paymentReference === reference && order.status === 'pendiente') {
          await ref.update({ status: 'confirmado' });
        }
      } catch (error) {
        console.error('[wompi-verify] No se pudo actualizar el estado del pedido.', error);
      }
    }

    return NextResponse.json({
      status,
      reference,
      amountInCents: tx?.amount_in_cents ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo contactar a Wompi.' }, { status: 502 });
  }
}
