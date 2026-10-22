import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { verifyMetaSignature, sendWhatsAppText } from '@/lib/whatsapp';
import { generateAgentReply } from '@/lib/aiAgent';
import { getSiteSettingsServer } from '@/lib/settingsServer';
import { DEFAULT_CRM_AI_AGENT, CRM_WEB_TAG } from '@/lib/types';
import { WEB_ORIGIN_TAG } from '@/lib/utils';

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
  const fromWeb = text.includes(WEB_ORIGIN_TAG);

  const contactRef = adminDb.collection('crmContacts').doc(phone);
  const contactSnap = await contactRef.get();

  if (!contactSnap.exists) {
    await contactRef.set({
      phone,
      name: name || phone,
      stage: 'nuevo',
      notes: '',
      tags: fromWeb ? [CRM_WEB_TAG] : [],
      lastMessageAt: now,
      lastMessagePreview: text,
      lastInboundAt: now,
      unreadCount: 1,
      nextFollowUpAt: null,
      createdAt: now,
    });
  } else {
    const existingTags: string[] = contactSnap.data()?.tags ?? [];
    await contactRef.update({
      ...(name ? { name } : {}),
      lastMessageAt: now,
      lastMessagePreview: text,
      lastInboundAt: now,
      unreadCount: FieldValue.increment(1),
      ...(fromWeb && !existingTags.includes(CRM_WEB_TAG) ? { tags: FieldValue.arrayUnion(CRM_WEB_TAG) } : {}),
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

// Después de guardar un mensaje de texto entrante, deja que el agente de
// IA conteste solo — si está activado en /admin/crm → Configuración y
// nadie lo pausó para esta clienta (la administradora le escribió a mano,
// o el mensaje pedía hablar con una persona). Cualquier fallo aquí (sin
// API key, Meta caído, etc.) se traga el error: el mensaje real de la
// clienta ya quedó guardado en la Bandeja de todas formas.
async function maybeAutoReply(phone: string, incomingText: string) {
  try {
    const contactRef = adminDb.collection('crmContacts').doc(phone);
    const contactSnap = await contactRef.get();
    if (!contactSnap.exists || contactSnap.data()?.aiPaused) return;

    const configSnap = await adminDb.doc('crmConfig/main').get();
    const agentConfig = { ...DEFAULT_CRM_AI_AGENT, ...(configSnap.data()?.aiAgent ?? {}) };
    if (!agentConfig.enabled) return;

    const historySnap = await adminDb
      .collection('crmMessages')
      .where('contactId', '==', phone)
      .orderBy('createdAt', 'desc')
      .limit(12)
      .get();
    const history = historySnap.docs
      .map((d) => ({ direction: d.data().direction as 'in' | 'out', text: d.data().text as string }))
      .reverse();

    const settings = await getSiteSettingsServer();
    const { text, needsHuman } = await generateAgentReply(settings, agentConfig, history);

    if (needsHuman) {
      await contactRef.update({ aiPaused: true });
      return;
    }
    if (!text) return;

    const result = await sendWhatsAppText(phone, text);
    if (!result.success) {
      console.error('[whatsapp webhook] El agente generó respuesta pero no se pudo enviar.', result.error);
      return;
    }

    const now = Date.now();
    await adminDb.collection('crmMessages').add({
      contactId: phone,
      direction: 'out',
      text,
      status: 'sent',
      waMessageId: result.waMessageId,
      automated: true,
      createdAt: now,
    });
    await contactRef.update({ lastMessageAt: now, lastMessagePreview: text });
  } catch (error) {
    console.error('[whatsapp webhook] Error en el agente de IA.', error);
  }
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
          if (message.type === 'text' && message.text?.body) {
            await maybeAutoReply(message.from, message.text.body);
          }
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
