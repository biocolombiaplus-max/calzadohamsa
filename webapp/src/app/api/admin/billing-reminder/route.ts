import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getBillingReminder,
  updateBillingReminder,
  type BillingReminder,
} from '@/lib/billingReminder';

export const dynamic = 'force-dynamic';

// Protegido con su propia clave (AGENCY_SECRET), separada del login de
// administradora que usa Diany — solo quien conoce esta clave puede leer o
// cambiar el aviso. No hay ninguna página pública que llame esto; el panel
// admin lee getBillingReminder() directamente en el servidor.
function isAuthorized(request: NextRequest) {
  const secret = process.env.AGENCY_SECRET;
  if (!secret) return false;
  return request.headers.get('x-agency-key') === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Clave incorrecta.' }, { status: 401 });
  }
  const reminder = await getBillingReminder();
  return NextResponse.json({ reminder });
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Clave incorrecta.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 });
  }

  const update: Partial<BillingReminder> = {};
  if (typeof body.active === 'boolean') update.active = body.active;
  if (Number.isFinite(Number(body.amountUsd)) && Number(body.amountUsd) > 0) {
    update.amountUsd = Number(body.amountUsd);
  }
  if (typeof body.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
    update.dueDate = body.dueDate;
  }

  try {
    await updateBillingReminder(update);
    const reminder = await getBillingReminder();
    return NextResponse.json({ reminder });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
