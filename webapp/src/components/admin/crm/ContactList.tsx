'use client';

import { useMemo, useState } from 'react';
import type { CrmContact } from '@/lib/types';
import { CRM_STAGE_LABELS } from '@/lib/types';
import { classNames, formatRelativeTime } from '@/lib/utils';

const STAGE_DOT: Record<string, string> = {
  nuevo: 'bg-primary',
  interesado: 'bg-amber-500',
  negociando: 'bg-blue-500',
  cliente: 'bg-green-600',
  perdido: 'bg-ink/30',
};

export default function ContactList({
  contacts,
  selectedId,
  onSelect,
}: {
  contacts: CrmContact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(term) || c.phone.includes(term));
  }, [contacts, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-muted">
            {contacts.length === 0 ? 'Todavía no ha escrito ninguna clienta.' : 'Sin resultados.'}
          </p>
        )}
        {filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={classNames(
              'flex w-full items-start gap-3 border-b border-border/60 p-3 text-left hover:bg-cream-alt/60',
              selectedId === c.id && 'bg-primary-light/15',
            )}
          >
            <span className={classNames('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', STAGE_DOT[c.stage])} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-ink">{c.name}</span>
                <span className="shrink-0 text-[11px] text-muted">{formatRelativeTime(c.lastMessageAt)}</span>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted">{c.lastMessagePreview || c.phone}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </span>
              <span className="mt-1 inline-block rounded-full bg-cream-alt px-2 py-0.5 text-[10px] font-semibold text-muted">
                {CRM_STAGE_LABELS[c.stage]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
