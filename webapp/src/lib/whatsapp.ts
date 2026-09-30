import { createHmac, timingSafeEqual } from 'crypto';

// Todo este archivo es SOLO de servidor (usa el Access Token de Meta, que
// nunca debe llegar al navegador) — se importa únicamente desde las rutas
// /api/whatsapp/*. Habla directo con la API oficial de WhatsApp Business
// Platform (Cloud API) de Meta, la misma que usan por debajo herramientas
// como Kommo — no hay atajos ni librerías no oficiales, así se respeta la
// política de Meta y el número no corre riesgo de ser bloqueado.

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

export function isWhatsAppConfigured(): boolean {
  return !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
}

interface SendResult {
  success: boolean;
  waMessageId?: string;
  error?: string;
}

async function callMetaApi(payload: Record<string, unknown>): Promise<SendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { success: false, error: 'WhatsApp no está configurado (faltan WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID).' };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error?.error_user_msg || data?.error?.message || `Meta respondió ${res.status}.`;
      return { success: false, error: message };
    }
    return { success: true, waMessageId: data?.messages?.[0]?.id };
  } catch {
    return { success: false, error: 'No se pudo contactar a la API de WhatsApp.' };
  }
}

// Mensaje de texto libre — SOLO válido dentro de las 24 horas siguientes al
// último mensaje que la clienta envió (ventana de servicio al cliente de
// Meta). Fuera de esa ventana, Meta rechaza el envío.
export function sendWhatsAppText(phone: string, text: string): Promise<SendResult> {
  return callMetaApi({ to: phone, type: 'text', text: { body: text, preview_url: false } });
}

// Plantilla PRE-APROBADA por Meta — la única forma válida de escribirle
// primero a una clienta (o de retomar la conversación después de 24h) sin
// arriesgar el número. El nombre debe coincidir exacto con una plantilla
// aprobada en Meta Business Manager.
export function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  language: string,
  params: string[],
): Promise<SendResult> {
  return callMetaApi({
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      ...(params.length
        ? { components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }] }
        : {}),
    },
  });
}

// Verifica que un webhook realmente venga de Meta (firma HMAC-SHA256 del
// cuerpo crudo con el App Secret de la app de Meta) — sin esto, cualquiera
// podría inyectar mensajes falsos en el CRM haciéndose pasar por Meta.
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;
  const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// La ventana de 24h se cuenta desde el ÚLTIMO mensaje ENTRANTE de la
// clienta (no desde el último saliente) — así lo define Meta.
export function isSessionWindowOpen(lastInboundAt: number | undefined): boolean {
  if (!lastInboundAt) return false;
  return Date.now() - lastInboundAt < 24 * 60 * 60 * 1000;
}
