import { NextResponse } from 'next/server';
import { adminAuth, adminDb, ADMIN_SDK_CONFIG_ERROR } from '@/lib/firebase-admin';
import { sendWhatsAppText, sendWhatsAppTemplate, isSessionWindowOpen, isWhatsAppConfigured } from '@/lib/whatsapp';

interface SendBody {
  contactId: string;
  type: 'text' | 'template';
  text?: string;
  templateId?: string;
  params?: string[];
}

// Ruta que usa el panel para mandar un mensaje uno a uno desde la bandeja
// del CRM. Solo la administradora autenticada puede llamarla (se verifica
// su token de Firebase en el servidor, igual que las reglas de Firestore
// verifican quién puede escribir en el resto del panel) y respeta la
// ventana de 24 horas de Meta: fuera de esa ventana, exige usar una
// plantilla aprobada en vez de texto libre, para no arriesgar el número.
export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: ADMIN_SDK_CONFIG_ERROR }, { status: 500 });
  }
  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      { error: 'WhatsApp no está configurado todavía (ver /admin/crm → Configuración).' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: 'Falta autenticación.' }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 });
  }

  const adminSnap = await adminDb.collection('admins').doc(uid).get();
  if (!adminSnap.exists) {
    return NextResponse.json({ error: 'No autorizada.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as SendBody | null;
  if (!body?.contactId || !body.type) {
    return NextResponse.json({ error: 'Faltan datos del mensaje.' }, { status: 400 });
  }

  const contactRef = adminDb.collection('crmContacts').doc(body.contactId);
  const contactSnap = await contactRef.get();
  if (!contactSnap.exists) {
    return NextResponse.json({ error: 'No se encontró esa clienta.' }, { status: 404 });
  }
  const contact = contactSnap.data() as { phone: string; lastInboundAt?: number };

  let result: { success: boolean; waMessageId?: string; error?: string };
  let text: string;
  let templateName: string | undefined;

  if (body.type === 'text') {
    if (!body.text?.trim()) return NextResponse.json({ error: 'El mensaje está vacío.' }, { status: 400 });
    if (!isSessionWindowOpen(contact.lastInboundAt)) {
      return NextResponse.json(
        {
          error:
            'Pasaron más de 24 horas desde el último mensaje de la clienta — Meta ya no permite texto libre. Usa una plantilla aprobada para retomar la conversación.',
        },
        { status: 409 },
      );
    }
    text = body.text.trim();
    result = await sendWhatsAppText(contact.phone, text);
  } else {
    if (!body.templateId) return NextResponse.json({ error: 'Falta la plantilla.' }, { status: 400 });
    const configSnap = await adminDb.doc('crmConfig/main').get();
    const template = (configSnap.data()?.templates ?? []).find((t: any) => t.id === body.templateId);
    if (!template) return NextResponse.json({ error: 'Esa plantilla ya no existe.' }, { status: 404 });

    const params = body.params ?? [];
    templateName = template.label;
    text = `📋 ${template.label}${params.length ? ': ' + params.join(' · ') : ''}`;
    result = await sendWhatsAppTemplate(contact.phone, template.name, template.language, params);
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error || 'No se pudo enviar el mensaje.' }, { status: 502 });
  }

  const now = Date.now();
  await adminDb.collection('crmMessages').add({
    contactId: body.contactId,
    direction: 'out',
    text,
    status: 'sent',
    waMessageId: result.waMessageId,
    ...(templateName ? { templateName } : {}),
    createdAt: now,
  });
  await contactRef.update({ lastMessageAt: now, lastMessagePreview: text, unreadCount: 0 });

  return NextResponse.json({ sent: true });
}
