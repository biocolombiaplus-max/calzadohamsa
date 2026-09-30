import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const API_VERSION = 'v21.0';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface CapiBody {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  phone?: string;
  fbp?: string;
  fbc?: string;
}

// Manda el mismo evento que ya se mandó desde el navegador (fbq) también
// desde el servidor, directo a Meta — así el evento llega aunque el
// celular de la clienta bloquee el pixel de JavaScript (Safari/iPhone
// sobre todo, donde es muy común). Usa el MISMO eventId que el pixel del
// navegador para que Meta los una como un solo evento, no lo cuente doble.
// Sin META_CONVERSIONS_API_TOKEN configurada, esta ruta simplemente no
// hace nada — el pixel del navegador sigue funcionando solo, igual que
// cualquier otra integración opcional de este proyecto.
export async function POST(request: Request) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) {
    return NextResponse.json({ skipped: true });
  }

  const body = (await request.json().catch(() => null)) as CapiBody | null;
  if (!body?.eventName || !body.eventId) {
    return NextResponse.json({ error: 'Faltan datos del evento.' }, { status: 400 });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const userAgent = request.headers.get('user-agent') ?? undefined;

  const userData: Record<string, unknown> = {
    ...(clientIp ? { client_ip_address: clientIp } : {}),
    ...(userAgent ? { client_user_agent: userAgent } : {}),
    ...(body.phone ? { ph: [sha256(body.phone.replace(/\D/g, ''))] } : {}),
    ...(body.fbp ? { fbp: body.fbp } : {}),
    ...(body.fbc ? { fbc: body.fbc } : {}),
  };

  const payload = {
    data: [
      {
        event_name: body.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId,
        action_source: 'website',
        ...(body.eventSourceUrl ? { event_source_url: body.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: {
          currency: body.currency || 'COP',
          value: body.value,
          ...(body.contentIds ? { content_ids: body.contentIds, content_type: 'product' } : {}),
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    );
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ error: `Meta respondió ${res.status}: ${errorText}` }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo contactar a Meta.' }, { status: 502 });
  }
}
