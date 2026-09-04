'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createOrder } from '@/lib/orders';
import { DEPARTMENTS } from '@/lib/departments';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/lib/types';
import LocationCapture from './LocationCapture';

export default function QuickBuyModal({ item, onClose }: { item: CartItem; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', department: '', note: '' });
  const [locationUrl, setLocationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = item.price * item.quantity;

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.phone || !form.address || !form.city || !form.department) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await createOrder({
        items: [item],
        subtotal: total,
        shipping: 0,
        total,
        customer: locationUrl ? { ...form, locationUrl } : form,
        paymentMethod: 'contra_entrega',
        status: 'pendiente',
      });
      router.push(`/pedido-confirmado/${id}`);
    } catch (err) {
      console.error(err);
      setError('No pudimos registrar tu pedido. Intenta de nuevo o escríbenos por WhatsApp.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-card bg-cream p-6 shadow-lift sm:rounded-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">💵 Compra contra entrega</h2>
            <p className="text-xs text-muted">Paga en efectivo cuando recibas tu pedido en la puerta</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-ink">
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-3 text-sm shadow-soft">
          <span className="text-ink">
            {item.title} <span className="text-muted">({item.size}, {item.color}) × {item.quantity}</span>
          </span>
          <span className="font-bold text-primary">{formatPrice(total)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nombre completo *"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            required
            type="tel"
            placeholder="Teléfono / WhatsApp *"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            required
            placeholder="Dirección de envío *"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Ciudad *"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <select
              required
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Departamento *</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Nota (opcional)"
            value={form.note}
            onChange={(e) => updateField('note', e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />

          <LocationCapture value={locationUrl} onCapture={setLocationUrl} />

          {error && <p className="rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base disabled:opacity-60">
            {submitting ? 'Procesando...' : `Confirmar pedido — ${formatPrice(total)}`}
          </button>
          <p className="text-center text-xs text-muted">🔒 Tus datos están seguros. Sin tarjeta, sin anticipo.</p>
        </form>
      </div>
    </div>
  );
}
