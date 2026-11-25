import { adminDb } from './firebase-admin';

// Colección deliberadamente separada de `siteSettings` (que se lee desde un
// endpoint público sin autenticación) — este es un aviso interno, solo de
// la agencia, y nunca debe quedar expuesto por una ruta pública.
const COLLECTION = 'internal';
const DOC_ID = 'billingReminder';

export interface BillingReminder {
  active: boolean;
  amountUsd: number;
  dueDate: string; // ISO date, ej. "2026-11-01"
}

export const DEFAULT_BILLING_REMINDER: BillingReminder = {
  active: false,
  amountUsd: 25,
  dueDate: '2026-11-01',
};

export async function getBillingReminder(): Promise<BillingReminder> {
  if (!adminDb) return DEFAULT_BILLING_REMINDER;
  const doc = await adminDb.collection(COLLECTION).doc(DOC_ID).get();
  const data = doc.data();
  if (!data) return DEFAULT_BILLING_REMINDER;
  return {
    active: typeof data.active === 'boolean' ? data.active : DEFAULT_BILLING_REMINDER.active,
    amountUsd: Number.isFinite(Number(data.amountUsd))
      ? Number(data.amountUsd)
      : DEFAULT_BILLING_REMINDER.amountUsd,
    dueDate:
      typeof data.dueDate === 'string' && data.dueDate
        ? data.dueDate
        : DEFAULT_BILLING_REMINDER.dueDate,
  };
}

export async function updateBillingReminder(partial: Partial<BillingReminder>) {
  if (!adminDb) throw new Error('Firebase admin no está configurado.');
  const fields = Object.keys(partial);
  if (fields.length === 0) return;
  await adminDb.collection(COLLECTION).doc(DOC_ID).set(partial, { mergeFields: fields });
}
