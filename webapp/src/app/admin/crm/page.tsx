'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CrmConfig, CrmContact, CrmMessage } from '@/lib/types';
import { subscribeToContacts, subscribeToMessages, subscribeToCrmConfig, markContactRead } from '@/lib/crm';
import { classNames } from '@/lib/utils';
import ContactList from '@/components/admin/crm/ContactList';
import ConversationThread from '@/components/admin/crm/ConversationThread';
import ContactDetailPanel from '@/components/admin/crm/ContactDetailPanel';
import PipelineBoard from '@/components/admin/crm/PipelineBoard';
import CrmSettingsPanel from '@/components/admin/crm/CrmSettingsPanel';

type View = 'bandeja' | 'embudo' | 'configuracion';

const TABS: { id: View; label: string }[] = [
  { id: 'bandeja', label: '💬 Bandeja' },
  { id: 'embudo', label: '📊 Embudo' },
  { id: 'configuracion', label: '⚙️ Configuración' },
];

export default function CrmPage() {
  const [view, setView] = useState<View>('bandeja');
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const [config, setConfig] = useState<CrmConfig>({ quickReplies: [], templates: [] });
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  useEffect(() => subscribeToContacts(setContacts), []);
  useEffect(() => subscribeToCrmConfig(setConfig), []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    return subscribeToMessages(selectedId, setMessages);
  }, [selectedId]);

  const selectedContact = useMemo(() => contacts.find((c) => c.id === selectedId) ?? null, [contacts, selectedId]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setShowDetailMobile(false);
    markContactRead(id);
  }

  const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[500px] flex-col sm:h-[calc(100vh-4rem)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl font-bold text-ink">
          CRM {totalUnread > 0 && <span className="text-sm font-normal text-primary">({totalUnread} sin leer)</span>}
        </h1>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setView(t.id)}
            className={classNames(
              'shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold',
              view === t.id ? 'bg-primary text-white' : 'bg-white text-ink shadow-sm',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-card bg-white shadow-soft">
        {view === 'bandeja' && (
          <div className="grid h-full grid-cols-1 sm:grid-cols-[19rem_1fr] lg:grid-cols-[19rem_1fr_19rem]">
            <div className={classNames('h-full min-h-0 border-border sm:border-r', selectedId ? 'hidden sm:block' : 'block')}>
              <ContactList contacts={contacts} selectedId={selectedId} onSelect={handleSelect} />
            </div>

            <div className={classNames('h-full min-h-0', selectedId ? 'block' : 'hidden sm:block')}>
              {selectedContact ? (
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-2 border-b border-border p-3 sm:px-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="shrink-0 text-lg text-ink sm:hidden"
                        aria-label="Volver a la lista"
                      >
                        ←
                      </button>
                      <p className="truncate text-sm font-bold text-ink">{selectedContact.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailMobile(true)}
                      className="shrink-0 text-xs font-semibold text-primary lg:hidden"
                    >
                      ℹ️ Detalles
                    </button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <ConversationThread
                      contact={selectedContact}
                      messages={messages}
                      quickReplies={config.quickReplies}
                      templates={config.templates}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <p className="text-center text-sm text-muted">Selecciona una conversación para verla aquí.</p>
                </div>
              )}
            </div>

            <div className="hidden h-full min-h-0 border-l border-border lg:block">
              {selectedContact ? (
                <ContactDetailPanel contact={selectedContact} />
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <p className="text-center text-xs text-muted">Aquí verás la ficha de la clienta.</p>
                </div>
              )}
            </div>

            {showDetailMobile && selectedContact && (
              <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <p className="text-sm font-bold text-ink">Ficha de {selectedContact.name}</p>
                  <button type="button" onClick={() => setShowDetailMobile(false)} className="text-lg text-ink">
                    ✕
                  </button>
                </div>
                <ContactDetailPanel contact={selectedContact} />
              </div>
            )}
          </div>
        )}

        {view === 'embudo' && (
          <PipelineBoard
            contacts={contacts}
            onOpenContact={(id) => {
              handleSelect(id);
              setView('bandeja');
            }}
          />
        )}

        {view === 'configuracion' && <CrmSettingsPanel config={config} />}
      </div>
    </div>
  );
}
