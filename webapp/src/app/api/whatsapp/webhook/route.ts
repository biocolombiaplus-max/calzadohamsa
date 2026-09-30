import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { verifyMetaSignature } from '@/lib/whatsapp';

// Webhook oficial de Meta (WhatsApp Business Platform / Cloud API). Meta
// llama aquí dos formas distintas:
//   GET  → solo una vez, al configurar el webhook en Meta Developers, para
//          comprobar que el servidor es tuyo (echo del "challenge").
//   POST → cada vez que llega un mensaje nuevo o cambia el estado de uno
//          que enviaste (entregado/leído/falló).
// Ver README.md para los pasos completos de configuración en Meta.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Token de verificación inválido.', { status: 403 });
}

type MetaMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: unknown;
  audio?: unknown;
  video?: unknown;
  document?: unknown;
  sticker?: unknown;
  location?: unknown;
};

type MetaStatus = { id: string; status: string; recipient_id: string };

const TYPE_LABELS: Record<string, string> = {
  image: '📷 Foto',
  audio: '🎤 Audio',
  video: '🎬 Video',
  document: '📄 Documento',
  sticker: '🌟 Sticker',
  location: '📍 Ubicación',
};

const STATUS_MAP: Record<string, 'sent' | 'delivered' | 'read' | 'failed'> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
};

async function upsertContactAndMessage(phone: string, name: string | undefined, message: MetaMessage) {
  const text = message.text?.body ?? TYPE_LABELS[message.type] ?? `[${message.type}]`;
  const now = Number(message.timestamp) ? Number(message.timestamp) * 1000 : Date.now();

  const contactRef = adminDb.collection('crmContacts').doc(phone);
  const contactSnap = await contactRef.get();

  if (!contactSnap.exists) {
    await contactRef.set({
      phone,
      name: name || phone,
      stage: 'nuevo',
      notes: '',
      tags: [],
      lastMessageAt: now,
      lastMessagePreview: text,
      lastInboundAt: now,
      unreadCount: 1,
      nextFollowUpAt: null,
      createdAt: now,
    });
  } else {
    await contactRef.update({
      ...(name ? { name } : {}),
      lastMessageAt: now,
      lastMessagePreview: text,
      lastInboundAt: now,
      unreadCount: FieldValue.increment(1),
    });
  }

  await adminDb.collection('crmMessages').add({
    contactId: phone,
    direction: 'in',
    text,
    waMessageId: message.id,
    createdAt: now,
  });
}

async function applyStatusUpdate(status: MetaStatus) {
  const mapped = STATUS_MAP[status.status];
  if (!mapped) return;
  const snap = await adminDb.collection('crmMessages').where('waMessageId', '==', status.id).limit(1).get();
  if (snap.empty) return;
  await snap.docs[0].ref.update({ status: mapped });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyMetaSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 });
  }

  // Meta reintenta (y eventualmente desactiva el webhook) si no responde
  // 200 rápido — si la cuenta de servicio no está configurada, igual se
  // reconoce la entrega para no perder la suscripción, aunque el mensaje
  // no quede guardado.
  if (!adminDb) {
    console.error('[whatsapp webhook] Falta configurar FIREBASE_ADMIN_* — no se pudo guardar el mensaje.');
    return NextResponse.json({ received: true, saved: false });
  }

  const payload = JSON.parse(rawBody);

  try {
    for (const entry of payload?.entry ?? []) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value;
        if (!value) continue;

        const profileName: string | undefined = value.contacts?.[0]?.profile?.name;
        for (const message of (value.messages ?? []) as MetaMessage[]) {
          await upsertContactAndMessage(message.from, profileName, message);
        }
        for (const status of (value.statuses ?? []) as MetaStatus[]) {
          await applyStatusUpdate(status);
        }
      }
    }
  } catch (error) {
    console.error('[whatsapp webhook] Error procesando el payload de Meta.', error);
  }

  return NextResponse.json({ received: true });
}
