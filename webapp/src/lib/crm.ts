'use client';

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { CrmContact, CrmMessage, CrmStage, CrmConfig } from './types';

const CONTACTS = 'crmContacts';
const MESSAGES = 'crmMessages';

function toMillis(value: unknown): number | undefined {
  return value instanceof Timestamp ? value.toMillis() : typeof value === 'number' ? value : undefined;
}

function toContact(id: string, data: any): CrmContact {
  return {
    id,
    phone: data.phone ?? '',
    name: data.name || data.phone || 'Sin nombre',
    stage: data.stage ?? 'nuevo',
    notes: data.notes ?? '',
    tags: data.tags ?? [],
    lastMessageAt: toMillis(data.lastMessageAt) ?? 0,
    lastMessagePreview: data.lastMessagePreview ?? '',
    lastInboundAt: toMillis(data.lastInboundAt),
    unreadCount: data.unreadCount ?? 0,
    nextFollowUpAt: toMillis(data.nextFollowUpAt) ?? null,
    createdAt: toMillis(data.createdAt) ?? 0,
  };
}

function toMessage(id: string, data: any): CrmMessage {
  return {
    id,
    contactId: data.contactId,
    direction: data.direction,
    text: data.text ?? '',
    status: data.status,
    waMessageId: data.waMessageId,
    templateName: data.templateName,
    createdAt: toMillis(data.createdAt) ?? 0,
  };
}

// Escucha en vivo la lista de contactos (bandeja + embudo), ordenada por
// última actividad — así la conversación más reciente siempre aparece
// primero, igual que en WhatsApp o Kommo.
export function subscribeToContacts(onChange: (contacts: CrmContact[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, CONTACTS), orderBy('lastMessageAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => toContact(d.id, d.data()))),
    () => {},
  );
}

export function subscribeToMessages(contactId: string, onChange: (messages: CrmMessage[]) => void): () => void {
  if (!db || !contactId) return () => {};
  const q = query(collection(db, MESSAGES), where('contactId', '==', contactId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => toMessage(d.id, d.data()))),
    () => {},
  );
}

export async function updateContactStage(contactId: string, stage: CrmStage): Promise<void> {
  await updateDoc(doc(db, CONTACTS, contactId), { stage });
}

export async function updateContactDetails(
  contactId: string,
  input: { name?: string; notes?: string; tags?: string[]; nextFollowUpAt?: number | null },
): Promise<void> {
  await updateDoc(doc(db, CONTACTS, contactId), input);
}

export async function markContactRead(contactId: string): Promise<void> {
  await updateDoc(doc(db, CONTACTS, contactId), { unreadCount: 0 });
}

const CONFIG_DOC = 'crmConfig/main';

export async function getCrmConfig(): Promise<CrmConfig> {
  if (!db) return { quickReplies: [], templates: [] };
  const snap = await getDoc(doc(db, CONFIG_DOC));
  const data = snap.data();
  return { quickReplies: data?.quickReplies ?? [], templates: data?.templates ?? [] };
}

export function subscribeToCrmConfig(onChange: (config: CrmConfig) => void): () => void {
  if (!db) return () => {};
  return onSnapshot(
    doc(db, CONFIG_DOC),
    (snap) => {
      const data = snap.data();
      onChange({ quickReplies: data?.quickReplies ?? [], templates: data?.templates ?? [] });
    },
    () => {},
  );
}

export async function saveCrmConfig(config: CrmConfig): Promise<void> {
  await setDoc(doc(db, CONFIG_DOC), config);
}

interface SendApiResult {
  ok: boolean;
  error?: string;
}

async function callSendApi(body: Record<string, unknown>): Promise<SendApiResult> {
  if (!auth?.currentUser) return { ok: false, error: 'Sesión expirada, vuelve a iniciar sesión.' };
  const idToken = await auth.currentUser.getIdToken();
  try {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error || `Error ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor.' };
  }
}

// Envía un mensaje de texto libre — solo funciona dentro de la ventana de
// 24 horas desde el último mensaje de la clienta (lo valida el servidor).
export function sendCrmText(contactId: string, text: string): Promise<SendApiResult> {
  return callSendApi({ contactId, type: 'text', text });
}

// Envía una plantilla pre-aprobada por Meta — la única forma de escribirle
// a una clienta fuera de la ventana de 24 horas sin arriesgar el número.
export function sendCrmTemplate(contactId: string, templateId: string, params: string[]): Promise<SendApiResult> {
  return callSendApi({ contactId, type: 'template', templateId, params });
}
