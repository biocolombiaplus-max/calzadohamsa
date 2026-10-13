'use client';

import { useEffect, useState } from 'react';
import type { CrmConfig, CrmQuickReply, CrmTemplate } from '@/lib/types';
import { saveCrmConfig } from '@/lib/crm';

interface Status {
  whatsappConfigured: boolean;
  adminSdkConfigured: boolean;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  aiConfigured: boolean;
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-green-600' : 'text-urgent'}>{ok ? '✓' : '✕'}</span>
      <span className={ok ? 'text-ink' : 'text-muted'}>{label}</span>
    </li>
  );
}

export default function CrmSettingsPanel({ config }: { config: CrmConfig }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [quickReplies, setQuickReplies] = useState<CrmQuickReply[]>(config.quickReplies);
  const [templates, setTemplates] = useState<CrmTemplate[]>(config.templates);
  const [aiEnabled, setAiEnabled] = useState(config.aiAgent.enabled);
  const [aiInstructions, setAiInstructions] = useState(config.aiAgent.instructions);
  const [aiSaved, setAiSaved] = useState(false);
  const [qrLabel, setQrLabel] = useState('');
  const [qrText, setQrText] = useState('');
  const [tName, setTName] = useState('');
  const [tLabel, setTLabel] = useState('');
  const [tLang, setTLang] = useState('es_CO');
  const [tVars, setTVars] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    setQuickReplies(config.quickReplies);
    setTemplates(config.templates);
    setAiEnabled(config.aiAgent.enabled);
    setAiInstructions(config.aiAgent.instructions);
  }, [config]);

  async function persist(next: { quickReplies: CrmQuickReply[]; templates: CrmTemplate[] }) {
    setSaving(true);
    await saveCrmConfig({ ...next, aiAgent: { enabled: aiEnabled, instructions: aiInstructions } });
    setSaving(false);
  }

  async function persistAiAgent(next: { enabled: boolean; instructions: string }) {
    setSaving(true);
    await saveCrmConfig({ quickReplies, templates, aiAgent: next });
    setSaving(false);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 1500);
  }

  function handleToggleAi() {
    const next = !aiEnabled;
    setAiEnabled(next);
    persistAiAgent({ enabled: next, instructions: aiInstructions });
  }

  function handleSaveAiInstructions() {
    persistAiAgent({ enabled: aiEnabled, instructions: aiInstructions });
  }

  function addQuickReply() {
    if (!qrLabel.trim() || !qrText.trim()) return;
    const next = [...quickReplies, { id: crypto.randomUUID(), label: qrLabel.trim(), text: qrText.trim() }];
    setQuickReplies(next);
    persist({ quickReplies: next, templates });
    setQrLabel('');
    setQrText('');
  }

  function removeQuickReply(id: string) {
    const next = quickReplies.filter((q) => q.id !== id);
    setQuickReplies(next);
    persist({ quickReplies: next, templates });
  }

  function addTemplate() {
    if (!tName.trim() || !tLabel.trim()) return;
    const next = [
      ...templates,
      {
        id: crypto.randomUUID(),
        name: tName.trim(),
        label: tLabel.trim(),
        language: tLang.trim() || 'es_CO',
        variableCount: Math.max(0, Number(tVars) || 0),
      },
    ];
    setTemplates(next);
    persist({ quickReplies, templates: next });
    setTName('');
    setTLabel('');
    setTVars('0');
  }

  function removeTemplate(id: string) {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    persist({ quickReplies, templates: next });
  }

  return (
    <div className="space-y-5 overflow-y-auto p-4">
      <div className="rounded-card bg-white p-4 shadow-soft">
        <h3 className="mb-2 font-heading text-sm font-bold text-ink">Estado de la conexión con Meta</h3>
        {status ? (
          <ul className="space-y-1.5">
            <StatusRow ok={status.adminSdkConfigured} label="Cuenta de servicio de Firebase (FIREBASE_ADMIN_*)" />
            <StatusRow ok={status.whatsappConfigured} label="Token y número de WhatsApp (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)" />
            <StatusRow ok={status.verifyTokenConfigured} label="Token de verificación del webhook (WHATSAPP_VERIFY_TOKEN)" />
            <StatusRow ok={status.appSecretConfigured} label="App Secret para validar los mensajes de Meta (WHATSAPP_APP_SECRET)" />
            <StatusRow ok={status.aiConfigured} label="API Key de IA para el agente automático (ANTHROPIC_API_KEY)" />
          </ul>
        ) : (
          <p className="text-xs text-muted">Verificando...</p>
        )}
        <p className="mt-3 text-xs text-muted">
          Sigue los pasos de <strong>README.md → &ldquo;CRM de WhatsApp&rdquo;</strong> para configurar estas
          variables en Vercel — sin ellas el CRM se ve, pero no puede mandar ni recibir mensajes reales todavía.
        </p>
      </div>

      <div className="rounded-card bg-white p-4 shadow-soft">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-heading text-sm font-bold text-ink">🤖 Agente con IA</h3>
          <button
            type="button"
            onClick={handleToggleAi}
            className={
              aiEnabled
                ? 'shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white'
                : 'shrink-0 rounded-full bg-cream-alt px-3 py-1 text-xs font-bold text-muted'
            }
          >
            {aiEnabled ? 'Activado' : 'Apagado'}
          </button>
        </div>
        <p className="mb-3 text-xs text-muted">
          Contesta sola a cada clienta nueva por WhatsApp, usando tu catálogo real, tus envíos y tus preguntas
          frecuentes. En cuanto tú le escribes a mano a una clienta, el agente se pausa solo para esa conversación
          — nunca contestan los dos a la vez. Si {status && !status.aiConfigured ? 'falta la ' : 'tienes la '}
          <code className="font-mono">ANTHROPIC_API_KEY</code> arriba en rojo, actívalo pero no contestará hasta que
          la agregues en Vercel (ver README.md → &ldquo;Agente con IA&rdquo;).
        </p>
        <label className="mb-1 block text-xs font-semibold text-muted">Instrucciones para el agente (en español)</label>
        <textarea
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          rows={5}
          placeholder="Ej: Sé cálida y breve. Si preguntan por una talla agotada, ofrece avisar cuando llegue. Nunca des descuentos sin que yo lo autorice."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button type="button" onClick={handleSaveAiInstructions} className="btn-secondary mt-2 px-4 py-2 text-sm">
          {aiSaved ? '✓ Guardado' : 'Guardar instrucciones'}
        </button>
      </div>

      <div className="rounded-card bg-white p-4 shadow-soft">
        <h3 className="mb-1 font-heading text-sm font-bold text-ink">Respuestas rápidas</h3>
        <p className="mb-3 text-xs text-muted">
          Frases guardadas que aparecen como botones sobre el cuadro de texto — para responder preguntas frecuentes
          con un toque, sin escribir de nuevo.
        </p>
        {quickReplies.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {quickReplies.map((qr) => (
              <li key={qr.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-2">
                <div>
                  <p className="text-xs font-bold text-ink">{qr.label}</p>
                  <p className="text-xs text-muted">{qr.text}</p>
                </div>
                <button type="button" onClick={() => removeQuickReply(qr.id)} className="shrink-0 text-xs font-bold text-urgent">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={qrLabel}
            onChange={(e) => setQrLabel(e.target.value)}
            placeholder="Botón (ej: Tallas disponibles)"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            placeholder="Mensaje que se envía"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button type="button" onClick={addQuickReply} className="btn-secondary mt-2 px-4 py-2 text-sm">
          + Agregar respuesta rápida
        </button>
      </div>

      <div className="rounded-card bg-white p-4 shadow-soft">
        <h3 className="mb-1 font-heading text-sm font-bold text-ink">Plantillas aprobadas por Meta</h3>
        <p className="mb-3 text-xs text-muted">
          Para escribirle primero a una clienta, o retomar una conversación después de 24h sin respuesta, Meta exige
          usar una plantilla ya aprobada en <strong>Meta Business Manager → WhatsApp Manager → Plantillas de
          mensajes</strong>. El &ldquo;Nombre&rdquo; de abajo debe ser IDÉNTICO al de Meta (minúsculas, sin
          espacios).
        </p>
        {templates.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {templates.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-2">
                <div>
                  <p className="text-xs font-bold text-ink">{t.label}</p>
                  <p className="text-xs text-muted">
                    {t.name} · {t.language} · {t.variableCount} variable(s)
                  </p>
                </div>
                <button type="button" onClick={() => removeTemplate(t.id)} className="shrink-0 text-xs font-bold text-urgent">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={tLabel}
            onChange={(e) => setTLabel(e.target.value)}
            placeholder="Nombre para ti (ej: Seguimiento)"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={tName}
            onChange={(e) => setTName(e.target.value)}
            placeholder="Nombre exacto en Meta (ej: seguimiento_v1)"
            className="rounded-lg border border-border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
          />
          <input
            value={tLang}
            onChange={(e) => setTLang(e.target.value)}
            placeholder="Idioma (ej: es_CO)"
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            min="0"
            value={tVars}
            onChange={(e) => setTVars(e.target.value)}
            placeholder="Cantidad de variables {{1}}, {{2}}..."
            className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button type="button" onClick={addTemplate} className="btn-secondary mt-2 px-4 py-2 text-sm">
          + Agregar plantilla
        </button>
      </div>
      {saving && <p className="text-center text-xs text-muted">Guardando...</p>}
    </div>
  );
}
