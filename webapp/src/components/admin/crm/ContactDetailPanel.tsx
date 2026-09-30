'use client';

import { useEffect, useState } from 'react';
import type { CrmContact, CrmStage } from '@/lib/types';
import { CRM_STAGES, CRM_STAGE_LABELS } from '@/lib/types';
import { updateContactDetails, updateContactStage } from '@/lib/crm';
import { whatsappLinkTo } from '@/lib/utils';

export default function ContactDetailPanel({ contact }: { contact: CrmContact }) {
  const [name, setName] = useState(contact.name);
  const [notes, setNotes] = useState(contact.notes ?? '');
  const [tagsText, setTagsText] = useState((contact.tags ?? []).join(', '));
  const [followUp, setFollowUp] = useState(
    contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toISOString().slice(0, 10) : '',
  );
  const [saved, setSaved] = useState(false);

  // Solo re-sincroniza los campos cuando cambia de clienta (contact.id) —
  // no en cada cambio de sus datos, o se pisaría lo que la administradora
  // está escribiendo en ese momento.
  useEffect(() => {
    setName(contact.name);
    setNotes(contact.notes ?? '');
    setTagsText((contact.tags ?? []).join(', '));
    setFollowUp(contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toISOString().slice(0, 10) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id]);

  async function handleSave() {
    await updateContactDetails(contact.id, {
      name: name.trim() || contact.phone,
      notes,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      nextFollowUpAt: followUp ? new Date(followUp).getTime() : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const followUpOverdue = contact.nextFollowUpAt && contact.nextFollowUpAt < Date.now();

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div>
        <p className="text-xs font-semibold text-muted">Teléfono</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-ink">{contact.phone}</p>
          <a
            href={whatsappLinkTo(contact.phone, '')}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Abrir en WhatsApp ↗
          </a>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Etapa del embudo</label>
        <select
          value={contact.stage}
          onChange={(e) => updateContactStage(contact.id, e.target.value as CrmStage)}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {CRM_STAGES.map((s) => (
            <option key={s} value={s}>
              {CRM_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Etiquetas (separadas por coma)</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="talla 37, urgente, vip"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Próximo seguimiento {followUpOverdue && <span className="text-urgent">· vencido</span>}
        </label>
        <input
          type="date"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Notas internas (no se envían)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ej: le interesa la talla 37 en camel, pidió que le avisemos cuando llegue..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <button type="button" onClick={handleSave} className="btn-secondary w-full py-2 text-sm">
        {saved ? '✓ Guardado' : 'Guardar ficha'}
      </button>
    </div>
  );
}
