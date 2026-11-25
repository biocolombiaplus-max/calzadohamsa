'use client';

import { useState, type FormEvent } from 'react';
import type { BillingReminder } from '@/lib/billingReminder';

export default function AgenciaPage() {
  const [key, setKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [reminder, setReminder] = useState<BillingReminder | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/billing-reminder', {
        headers: { 'x-agency-key': key },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Clave incorrecta.');
      setReminder(data.reminder);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!reminder) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/billing-reminder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-agency-key': key },
        body: JSON.stringify(reminder),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar.');
      setReminder(data.reminder);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setSaving(false);
    }
  }

  if (!unlocked || !reminder) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-24 text-center">
        <h1 className="font-heading text-lg font-bold text-ink">Acceso restringido</h1>
        <p className="mt-1 text-sm text-muted">Ingresa la clave de agencia para continuar.</p>
        <form onSubmit={handleUnlock} className="mt-6 w-full space-y-3">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Clave de agencia"
            autoFocus
            className="w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!key || loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          {error && <p className="text-sm text-urgent">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <h1 className="font-heading text-xl font-bold text-ink">
        Aviso de pago pendiente — control interno
      </h1>
      <p className="mb-8 mt-2 text-sm text-muted">
        Esto controla el aviso que ve Diany al entrar al panel admin de Hamsa
        Shoes. No está enlazado desde ningún menú — solo tú tienes esta URL y
        la clave.
      </p>

      <div className="space-y-5 rounded-card border border-border bg-white p-6 shadow-soft">
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3.5">
          <span className="text-sm font-semibold text-ink">
            {reminder.active ? 'Aviso activo' : 'Aviso desactivado'}
          </span>
          <input
            type="checkbox"
            checked={reminder.active}
            onChange={(e) => setReminder({ ...reminder, active: e.target.checked })}
            className="h-5 w-9 accent-primary"
          />
        </label>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
            Monto (USD)
          </label>
          <input
            type="number"
            min={0}
            value={reminder.amountUsd}
            onChange={(e) =>
              setReminder({ ...reminder, amountUsd: Number(e.target.value) || 0 })
            }
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            value={reminder.dueDate}
            onChange={(e) => setReminder({ ...reminder, dueDate: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
        {error && <p className="text-sm text-urgent">{error}</p>}
      </div>
    </div>
  );
}
