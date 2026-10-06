'use client';

import type { CrmContact, CrmStage } from '@/lib/types';
import { CRM_STAGES, CRM_STAGE_LABELS } from '@/lib/types';
import { updateContactStage } from '@/lib/crm';
import { classNames, formatRelativeTime } from '@/lib/utils';

// Colores por etapa — los mismos que ya usa el puntico de ContactList, para
// que la clienta se reconozca de un vistazo entre la bandeja y el embudo.
const STAGE_STYLES: Record<CrmStage, { accent: string; dot: string; badgeBg: string; badgeText: string }> = {
  nuevo: { accent: 'bg-primary', dot: 'bg-primary', badgeBg: 'bg-primary/10', badgeText: 'text-primary' },
  interesado: { accent: 'bg-amber-500', dot: 'bg-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
  negociando: { accent: 'bg-blue-500', dot: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' },
  cliente: { accent: 'bg-green-600', dot: 'bg-green-600', badgeBg: 'bg-green-50', badgeText: 'text-green-700' },
  perdido: { accent: 'bg-ink/30', dot: 'bg-ink/30', badgeBg: 'bg-ink/5', badgeText: 'text-muted' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

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
  const total = contacts.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 overflow-x-auto border-b border-border bg-cream-alt/40 px-3 py-2.5">
        <p className="shrink-0 text-xs font-semibold text-muted">{total} {total === 1 ? 'clienta' : 'clientas'} en el embudo</p>
        <div className="flex shrink-0 gap-1.5">
          {CRM_STAGES.map((stage) => {
            const count = contacts.filter((c) => c.stage === stage).length;
            const style = STAGE_STYLES[stage];
            return (
              <span
                key={stage}
                className={classNames('flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', style.badgeBg, style.badgeText)}
              >
                <span className={classNames('h-1.5 w-1.5 rounded-full', style.dot)} />
                {count}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto p-3">
        {CRM_STAGES.map((stage, stageIndex) => {
          const stageContacts = contacts.filter((c) => c.stage === stage);
          const style = STAGE_STYLES[stage];
          return (
            <div key={stage} className="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-cream-alt/60 shadow-sm">
              <div className={classNames('h-1', style.accent)} />
              <div className="flex items-center justify-between border-b border-border bg-white/70 p-2.5">
                <p className="text-sm font-bold text-ink">{CRM_STAGE_LABELS[stage]}</p>
                <span className={classNames('rounded-full px-2 py-0.5 text-xs font-bold', style.badgeBg, style.badgeText)}>
                  {stageContacts.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {stageContacts.map((c) => {
                  const isOverdue = !!c.nextFollowUpAt && c.nextFollowUpAt < Date.now();
                  return (
                    <div key={c.id} className="rounded-lg bg-white p-2.5 shadow-sm transition hover:shadow-md">
                      <button type="button" onClick={() => onOpenContact(c.id)} className="flex w-full items-start gap-2 text-left">
                        <span
                          className={classNames(
                            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white',
                            style.accent,
                          )}
                        >
                          {getInitials(c.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-1">
                            <span className="truncate text-sm font-semibold text-ink">{c.name}</span>
                            {c.unreadCount > 0 && (
                              <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                                {c.unreadCount}
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-muted">{c.lastMessagePreview || c.phone}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted">
                            {formatRelativeTime(c.lastMessageAt)}
                            {isOverdue && <span className="font-semibold text-urgent">· 📅 seguimiento pendiente</span>}
                          </span>
                        </span>
                      </button>
                      {!!c.tags?.length && (
                        <div className="mt-1.5 flex flex-wrap gap-1 pl-9">
                          {c.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-cream-alt px-1.5 py-0.5 text-[10px] font-medium text-muted">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
                  );
                })}
                {stageContacts.length === 0 && <p className="p-2 text-center text-xs text-muted">Vacío</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
