import { adminDb } from '@/lib/firebase-admin';
import type { CrmAiAgentConfig, SiteSettings } from '@/lib/types';

// Agente de ventas con IA del CRM de WhatsApp — SOLO de servidor (usa la
// API Key de Gemini, que nunca debe llegar al navegador). Se invoca desde
// el webhook de Meta cada vez que llega un mensaje nuevo de una clienta y
// el agente está activado. Usa el modelo "flash" (rápido y con nivel
// gratuito generoso en Google AI Studio) porque es un mensaje corto de
// atención al cliente, no una tarea compleja.

const MODEL = 'gemini-2.5-flash';
const MAX_HISTORY_MESSAGES = 12;

export function isAiAgentConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function formatCOP(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

// Arma el "conocimiento" real de la tienda que el agente puede usar para
// responder — catálogo activo, envíos y las preguntas frecuentes que la
// propia administradora ya escribió en /admin/configuracion. Si algo no
// está aquí, el agente tiene instrucción explícita de no inventarlo.
async function buildStoreContext(settings: SiteSettings): Promise<string> {
  const parts: string[] = [];

  parts.push(`Tienda: ${settings.storeName}`);

  if (settings.shipping) {
    const { defaultRate, rates } = settings.shipping;
    parts.push(
      `Envío: ${defaultRate > 0 ? `tarifa estándar ${formatCOP(defaultRate)}` : 'gratis'} a nivel nacional en Colombia` +
        (rates?.length ? `, con tarifas distintas en algunos departamentos (confírmale el valor exacto según su ciudad si pregunta).` : '.'),
    );
  }

  if (settings.faq?.length) {
    parts.push('Preguntas frecuentes de la tienda (úsalas tal cual si aplican):');
    for (const item of settings.faq.slice(0, 15)) {
      parts.push(`P: ${item.question}\nR: ${item.answer}`);
    }
  }

  if (settings.trustItems?.length) {
    parts.push('Garantías/beneficios de comprar aquí: ' + settings.trustItems.map((t) => `${t.title} (${t.sub})`).join(' · '));
  }

  try {
    if (adminDb) {
      const snap = await adminDb.collection('products').where('active', '==', true).limit(60).get();
      if (!snap.empty) {
        parts.push('Catálogo disponible ahora mismo (nombre: precio, tallas, colores):');
        for (const doc of snap.docs) {
          const p = doc.data() as any;
          if ((p.stock ?? 0) <= 0) continue;
          const sizes = (p.sizes ?? []).join(', ');
          const colors = (p.colors ?? []).map((c: any) => c.name).join(', ');
          parts.push(`- ${p.title}: ${formatCOP(p.price)}${sizes ? `, tallas ${sizes}` : ''}${colors ? `, colores ${colors}` : ''}`);
        }
      }
    }
  } catch {
    // Si falla traer el catálogo, el agente sigue funcionando solo con
    // envíos + FAQ — mejor una respuesta limitada que ninguna.
  }

  return parts.join('\n');
}

interface HistoryMessage {
  direction: 'in' | 'out';
  text: string;
}

function buildSystemPrompt(storeContext: string, instructions: string): string {
  return `Eres el asistente de ventas por WhatsApp de una tienda de calzado en Colombia que vende por pago contra entrega. Hablas español de Colombia, cálido y cercano, como una asesora real, nunca como un robot formal.

INSTRUCCIONES DE LA DUEÑA DE LA TIENDA:
${instructions}

INFORMACIÓN REAL DE LA TIENDA (usa SOLO esto para precios, tallas, envíos y políticas — si algo no está aquí, di que ya lo confirmas con el equipo, nunca lo inventes):
${storeContext}

REGLAS QUE NUNCA ROMPES:
- Máximo 3-4 líneas por respuesta. Nada de párrafos largos.
- Nunca inventes precios, tallas, colores, plazos de envío ni descuentos que no estén en la información de arriba.
- Nunca prometas una fecha de entrega exacta si no está en la información.
- Si la clienta pide hablar con una persona, se queja de un pedido, pide un descuento especial, o la conversación se sale de temas de ventas/tallas/envíos, responde brevemente y dile que ya la atiende el equipo — no sigas insistiendo en vender.
- Usa emojis con moderación (0-2 por mensaje), nunca en exceso.
- Si te preguntan directamente si eres un robot o una IA, sé honesta.
- No pidas datos de tarjetas ni información financiera — el pago es contra entrega.`;
}

interface AgentResult {
  text: string | null;
  needsHuman: boolean;
}

const HANDOFF_KEYWORDS = [
  'hablar con una persona',
  'hablar con alguien',
  'asesor humano',
  'quiero un humano',
  'reclamo',
  'queja',
  'estafa',
  'demanda',
];

export function messageNeedsHandoff(text: string): boolean {
  const lower = text.toLowerCase();
  return HANDOFF_KEYWORDS.some((k) => lower.includes(k));
}

// Genera la respuesta del agente para el último mensaje entrante de una
// clienta, dado el historial reciente de la conversación. Devuelve null si
// no se pudo generar (sin API key, error de red, etc.) — el webhook
// simplemente no contesta nada en ese caso, para no bloquear el mensaje
// real de la clienta.
export async function generateAgentReply(
  settings: SiteSettings,
  agentConfig: CrmAiAgentConfig,
  history: HistoryMessage[],
): Promise<AgentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !agentConfig.enabled) return { text: null, needsHuman: false };

  const lastInbound = [...history].reverse().find((m) => m.direction === 'in');
  if (lastInbound && messageNeedsHandoff(lastInbound.text)) {
    return { text: null, needsHuman: true };
  }

  const storeContext = await buildStoreContext(settings);
  const system = buildSystemPrompt(storeContext, agentConfig.instructions);

  const trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  // Gemini usa "model" en vez de "assistant", y exige que la conversación
  // empiece con un turno "user".
  const contents = trimmed.map((m) => ({
    role: m.direction === 'in' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.text }],
  }));
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (contents.length === 0) return { text: null, needsHuman: false };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 300 },
        }),
      },
    );
    if (!res.ok) {
      console.error('[aiAgent] Gemini respondió', res.status, await res.text().catch(() => ''));
      return { text: null, needsHuman: false };
    }
    const data = await res.json();
    const text = ((data?.candidates?.[0]?.content?.parts ?? []) as { text?: string }[])
      .map((part) => part.text ?? '')
      .join('\n')
      .trim();
    return { text: text || null, needsHuman: false };
  } catch (error) {
    console.error('[aiAgent] Error llamando a la API de Gemini.', error);
    return { text: null, needsHuman: false };
  }
}
