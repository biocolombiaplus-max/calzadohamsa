'use client';

import { useEffect, useRef, useState } from 'react';
import type { CrmContact, CrmMessage, CrmQuickReply, CrmTemplate } from '@/lib/types';
import { sendCrmText, sendCrmTemplate } from '@/lib/crm';
import { classNames, formatRelativeTime } from '@/lib/utils';

const SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

const STATUS_ICON: Record<string, string> = {
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
  failed: '⚠️',
};

function TemplatePicker({
  templates,
  onCancel,
  onSend,
}: {
  templates: CrmTemplate[];
  onCancel: () => void;
  onSend: (templateId: string, params: string[]) => void;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const template = templates.find((t) => t.id === templateId);
  const [params, setParams] = useState<string[]>([]);

  useEffect(() => {
    setParams(Array(template?.variableCount ?? 0).fill(''));
  }, [template?.variableCount, templateId]);

  if (templates.length === 0) {
    return (
      <p className="rounded-lg bg-urgent/10 p-3 text-xs text-urgent">
        No tienes plantillas configuradas todavía — agrégalas en la pestaña &ldquo;⚙️ Configuración&rdquo; (deben
        estar aprobadas primero en Meta Business Manager).
      </p>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-cream-alt/50 p-3">
      <select
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      {params.map((value, i) => (
        <input
          key={i}
          value={value}
          onChange={(e) => setParams((p) => p.map((v, idx) => (idx === i ? e.target.value : v)))}
          placeholder={`Variable {{${i + 1}}}`}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      ))}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => templateId && onSend(templateId, params)}
          className="btn-primary flex-1 py-2 text-sm"
        >
          Enviar plantilla
        </button>
      </div>
    </div>
  );
}

export default function ConversationThread({
  contact,
  messages,
  quickReplies,
  templates,
}: {
  contact: CrmContact;
  messages: CrmMessage[];
  quickReplies: CrmQuickReply[];
  templates: CrmTemplate[];
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, contact.id]);

  const sessionOpen = !!contact.lastInboundAt && Date.now() - contact.lastInboundAt < SESSION_WINDOW_MS;

  async function handleSendText() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError('');
    const result = await sendCrmText(contact.id, value);
    setSending(false);
    if (!result.ok) {
      setError(result.error || 'No se pudo enviar.');
      if (result.error?.includes('24 horas')) setShowTemplates(true);
      return;
    }
    setText('');
  }

  async function handleSendTemplate(templateId: string, params: string[]) {
    setSending(true);
    setError('');
    const result = await sendCrmTemplate(contact.id, templateId, params);
    setSending(false);
    if (!result.ok) {
      setError(result.error || 'No se pudo enviar la plantilla.');
      return;
    }
    setShowTemplates(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto bg-cream-alt/30 p-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted">Todavía no hay mensajes con esta clienta.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={classNames('flex', m.direction === 'out' ? 'justify-end' : 'justify-start')}>
            <div
              className={classNames(
                'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                m.direction === 'out' ? 'bg-primary text-white' : 'bg-white text-ink',
              )}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              <p
                className={classNames(
                  'mt-1 flex items-center justify-end gap-1 text-[10px]',
                  m.direction === 'out' ? 'text-white/70' : 'text-muted',
                )}
              >
                {formatRelativeTime(m.createdAt)}
                {m.direction === 'out' && m.status && <span>{STATUS_ICON[m.status] ?? ''}</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-white p-3">
        {error && <p className="mb-2 rounded-lg bg-urgent/10 p-2 text-xs text-urgent">{error}</p>}

        {!sessionOpen && !showTemplates && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
            <span>
              ⏱️ Pasaron más de 24h desde su último mensaje — Meta solo permite reabrir con una plantilla aprobada.
            </span>
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              className="shrink-0 font-bold underline underline-offset-2"
            >
              Usar plantilla
            </button>
          </div>
        )}

        {showTemplates ? (
          <TemplatePicker templates={templates} onCancel={() => setShowTemplates(false)} onSend={handleSendTemplate} />
        ) : (
          <>
            {quickReplies.length > 0 && sessionOpen && (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => setText(qr.text)}
                    className="shrink-0 rounded-full bg-cream-alt px-3 py-1 text-xs font-semibold text-ink hover:bg-primary-light/20"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                disabled={!sessionOpen || sending}
                rows={1}
                placeholder={sessionOpen ? 'Escribe un mensaje...' : 'Usa una plantilla para reabrir la conversación'}
                className="flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-cream-alt disabled:text-muted"
              />
              <button
                type="button"
                onClick={handleSendText}
                disabled={!sessionOpen || sending || !text.trim()}
                className="btn-primary px-4 text-sm disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
