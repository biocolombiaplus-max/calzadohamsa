'use client';

import type { CrmContact, CrmStage } from '@/lib/types';
import { CRM_STAGES, CRM_STAGE_LABELS } from '@/lib/types';
import { updateContactStage } from '@/lib/crm';
import { formatRelativeTime } from '@/lib/utils';

// Tablero estilo Kommo, con botones "◀ ▶" para mover a la clienta de etapa
// en vez de arrastrar y soltar — en el celular (donde la administradora
// trabaja la mayoría del tiempo) el "drag and drop" con el dedo falla más
// de lo que ayuda, así que esto es más confiable y igual de rápido.
export default function PipelineBoard({
  contacts,
  onOpenContact,
}: {
  contacts: CrmContact[];
  onOpenContact: (id: string) => void;
}) {
  return (
    <div className="flex h-full gap-3 overflow-x-auto p-3">
      {CRM_STAGES.map((stage, stageIndex) => {
        const stageContacts = contacts.filter((c) => c.stage === stage);
        return (
          <div key={stage} className="flex w-64 shrink-0 flex-col rounded-lg bg-cream-alt/60">
            <div className="flex items-center justify-between border-b border-border p-2.5">
              <p className="text-sm font-bold text-ink">{CRM_STAGE_LABELS[stage]}</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted">
                {stageContacts.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {stageContacts.map((c) => (
                <div key={c.id} className="rounded-lg bg-white p-2.5 shadow-sm">
                  <button type="button" onClick={() => onOpenContact(c.id)} className="block w-full text-left">
                    <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                    <p className="truncate text-xs text-muted">{c.lastMessagePreview || c.phone}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{formatRelativeTime(c.lastMessageAt)}</p>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      disabled={stageIndex === 0}
                      onClick={() => updateContactStage(c.id, CRM_STAGES[stageIndex - 1] as CrmStage)}
                      className="rounded bg-cream-alt px-2 py-1 text-xs font-bold text-ink disabled:opacity-30"
                    >
                      ◀
                    </button>
                    <span className="text-[10px] text-muted">mover</span>
                    <button
                      type="button"
                      disabled={stageIndex === CRM_STAGES.length - 1}
                      onClick={() => updateContactStage(c.id, CRM_STAGES[stageIndex + 1] as CrmStage)}
                      className="rounded bg-cream-alt px-2 py-1 text-xs font-bold text-ink disabled:opacity-30"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
              {stageContacts.length === 0 && <p className="p-2 text-center text-xs text-muted">Vacío</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
