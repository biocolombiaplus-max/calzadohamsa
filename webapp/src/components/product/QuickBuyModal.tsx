'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createOrder } from '@/lib/orders';
import { DEPARTMENTS } from '@/lib/departments';
import { formatPrice } from '@/lib/utils';
import { generatePaymentReference, redirectToWompiCheckout } from '@/lib/wompi';
import type { CartItem } from '@/lib/types';
import LocationCapture from './LocationCapture';

export default function QuickBuyModal({
  items,
  totalOverride,
  discountLabel,
  title = '💵 Compra contra entrega',
  mode = 'cod',
  onClose,
}: {
  items: CartItem[];
  totalOverride?: number;
  discountLabel?: string;
  title?: string;
  mode?: 'cod' | 'wompi';
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', department: '', note: '' });
  const [locationUrl, setLocationUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = totalOverride ?? subtotal;

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
      if (mode === 'wompi') {
        const reference = generatePaymentReference();
        const { id } = await createOrder({
          items,
          subtotal,
          shipping: 0,
          total,
          customer: locationUrl ? { ...form, locationUrl } : form,
          paymentMethod: 'wompi',
          status: 'pendiente',
          paymentReference: reference,
        });
        await redirectToWompiCheckout({
          amountInCents: Math.round(total * 100),
          reference,
          redirectUrl: `${window.location.origin}/pedido-confirmado/${id}`,
          customerFullName: form.name,
          customerPhone: form.phone,
        });
        return;
      }

      const { id } = await createOrder({
        items,
        subtotal,
        shipping: 0,
        total,
        customer: locationUrl ? { ...form, locationUrl } : form,
        paymentMethod: 'contra_entrega',
        status: 'pendiente',
      });
      router.push(`/pedido-confirmado/${id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No pudimos registrar tu pedido. Intenta de nuevo.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-card bg-cream p-6 shadow-lift sm:rounded-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">{title}</h2>
            <p className="text-xs text-muted">
              {mode === 'wompi'
                ? 'Pagas en línea ahora mismo con tarjeta, PSE o Nequi'
                : 'Paga en efectivo cuando recibas tu pedido en la puerta'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-ink">
            ✕
          </button>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-white p-3 text-sm shadow-soft">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-ink">
                {item.title} <span className="text-muted">({item.size}, {item.color}) × {item.quantity}</span>
              </span>
              <span className="font-semibold text-ink">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          {discountLabel && (
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs font-bold text-primary">
              <span>{discountLabel}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2 font-bold text-ink">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
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

          <button
            type="submit"
            disabled={submitting}
            className={mode === 'wompi' ? 'w-full rounded-card bg-gradient-to-r from-urgent to-primary px-6 py-3.5 text-base font-bold text-white shadow-lift disabled:opacity-60' : 'btn-primary w-full text-base disabled:opacity-60'}
          >
            {submitting
              ? 'Procesando...'
              : mode === 'wompi'
                ? `⚡ Pagar ahora — ${formatPrice(total)}`
                : `Confirmar pedido — ${formatPrice(total)}`}
          </button>
          <p className="text-center text-xs text-muted">
            {mode === 'wompi' ? '🔒 Pago 100% seguro procesado por Wompi' : '🔒 Tus datos están seguros. Sin tarjeta, sin anticipo.'}
          </p>
        </form>
      </div>
    </div>
  );
}
