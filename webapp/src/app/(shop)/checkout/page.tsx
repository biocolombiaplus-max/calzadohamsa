'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { createOrder } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';
import { DEPARTMENTS } from '@/lib/departments';
import type { PaymentMethod } from '@/lib/types';
import LocationCapture from '@/components/product/LocationCapture';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, subtotal, clear } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('contra_entrega');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', department: '', note: '' });
  const [locationUrl, setLocationUrl] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace('/carrito');
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

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
      const total = subtotal();
      const { id } = await createOrder({
        items,
        subtotal: total,
        shipping: 0,
        total,
        customer: locationUrl ? { ...form, locationUrl } : form,
        paymentMethod,
        status: 'pendiente',
      });
      clear();
      router.push(`/pedido-confirmado/${id}`);
    } catch (err) {
      console.error(err);
      setError('No pudimos registrar tu pedido. Por favor intenta de nuevo o escríbenos por WhatsApp.');
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-2 font-heading text-3xl font-bold text-ink">Finalizar compra</h1>
      <p className="mb-8 text-sm text-muted">Solo necesitamos unos datos para enviarte tu pedido</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Nombre completo *</label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="Ej: María Pérez"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Teléfono / WhatsApp *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="Ej: 3001234567"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Dirección de envío *</label>
            <input
              required
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              placeholder="Calle, número, barrio"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Ciudad *</label>
              <input
                required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Departamento *</label>
              <select
                required
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 focus:border-primary focus:outline-none"
              >
                <option value="">Selecciona...</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Nota (opcional)</label>
            <textarea
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 focus:border-primary focus:outline-none"
              rows={2}
              placeholder="Indicaciones adicionales para tu entrega"
            />
          </div>

          <LocationCapture value={locationUrl} onCapture={setLocationUrl} />

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Método de pago</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-light/10">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'contra_entrega'}
                  onChange={() => setPaymentMethod('contra_entrega')}
                />
                <span>
                  <span className="block text-sm font-bold text-ink">💵 Pago contra entrega</span>
                  <span className="block text-xs text-muted">Paga en efectivo cuando recibas tu pedido</span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-light/10">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'transferencia'}
                  onChange={() => setPaymentMethod('transferencia')}
                />
                <span>
                  <span className="block text-sm font-bold text-ink">🏦 Transferencia bancaria</span>
                  <span className="block text-xs text-muted">Te enviamos los datos por WhatsApp al confirmar</span>
                </span>
              </label>
            </div>
          </div>

          {error && <p className="rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base disabled:opacity-60">
            {submitting ? 'Procesando...' : `Confirmar pedido — ${formatPrice(subtotal())}`}
          </button>
          <p className="text-center text-xs text-muted">🔒 Tus datos están seguros y protegidos</p>
        </form>

        <div className="h-fit rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Tu pedido</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <span className="text-ink">
                  {item.title} <span className="text-muted">× {item.quantity}</span>
                  <span className="block text-xs text-muted">
                    Talla {item.size} · {item.color}
                  </span>
                </span>
                <span className="whitespace-nowrap font-semibold text-ink">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Envío</span>
            <span className="font-semibold text-primary">GRATIS</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          <Link href="/carrito" className="mt-4 block text-center text-sm text-muted hover:text-primary">
            ← Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
