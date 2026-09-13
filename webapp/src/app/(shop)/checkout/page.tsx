'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { createOrder } from '@/lib/orders';
import { formatPrice } from '@/lib/utils';
import { getDepartamentos, getMunicipios } from '@/lib/colombia';
import { getShippingRate } from '@/lib/shipping';
import { computeBundlePricing } from '@/lib/bundle';
import { getActiveCoupon, clearCoupon, redeemCouponCode } from '@/lib/coupon';
import { useSiteSettings } from '@/lib/settings-context';
import { classNames } from '@/lib/utils';
import { generatePaymentReference, isWompiConfigured, redirectToWompiCheckout } from '@/lib/wompi';
import type { PaymentMethod } from '@/lib/types';
import LocationCapture from '@/components/product/LocationCapture';
import PaymentBadges from '@/components/PaymentBadges';

const DEPARTAMENTOS = getDepartamentos();

const REQUIRED_FIELDS = ['name', 'phone', 'address', 'department', 'city'] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const settings = useSiteSettings();
  const [mounted, setMounted] = useState(false);
  const { items, clear } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('contra_entrega');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', department: '', note: '' });
  const [locationUrl, setLocationUrl] = useState('');
  const [coupon, setCoupon] = useState(() => getActiveCoupon());
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const bundle = useMemo(() => computeBundlePricing(items, settings.bundle2x1.price), [items, settings.bundle2x1.price]);
  const municipios = useMemo(() => getMunicipios(form.department), [form.department]);
  const couponDiscount = coupon ? Math.round(bundle.discountedSubtotal * (coupon.percent / 100)) : 0;
  const finalSubtotal = bundle.discountedSubtotal - couponDiscount;
  const shippingCost = bundle.hasFreeShipping
    ? 0
    : form.department
      ? getShippingRate(settings.shipping, form.department, form.city)
      : 0;
  const total = finalSubtotal + shippingCost;
  const wompiSubtotal = Math.round(finalSubtotal * 0.95);
  const wompiTotal = wompiSubtotal + shippingCost;

  const fieldErrors = useMemo(
    () => ({
      name: !form.name.trim(),
      phone: !form.phone.trim(),
      address: !form.address.trim(),
      department: !form.department,
      city: !form.city,
    }),
    [form],
  );
  const hasErrors = REQUIRED_FIELDS.some((f) => fieldErrors[f]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!attemptedSubmit || !hasErrors) return;
    document.querySelector('.border-urgent')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [attemptedSubmit, hasErrors]);

  useEffect(() => {
    if (mounted && items.length === 0) router.replace('/carrito');
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => (key === 'department' ? { ...f, department: value, city: '' } : { ...f, [key]: value }));
  }

  function fieldClass(field: keyof typeof fieldErrors) {
    return classNames(
      'w-full rounded-lg border px-4 py-3 focus:outline-none',
      attemptedSubmit && fieldErrors[field]
        ? 'border-urgent focus:border-urgent'
        : 'border-border focus:border-primary',
    );
  }

  function handleApplyCoupon() {
    setCouponError('');
    const result = redeemCouponCode(couponInput);
    if (!result) {
      setCouponError('Ese cupón no es válido o ya venció.');
      return;
    }
    setCoupon(result);
    setCouponInput('');
  }

  function handleRemoveCoupon() {
    clearCoupon();
    setCoupon(null);
  }

  async function submitOrder(method: PaymentMethod) {
    setSubmitting(true);
    try {
      if (method === 'wompi') {
        const reference = generatePaymentReference();
        const { id } = await createOrder({
          items,
          subtotal: wompiSubtotal,
          shipping: shippingCost,
          total: wompiTotal,
          customer: locationUrl ? { ...form, locationUrl } : form,
          paymentMethod: 'wompi',
          status: 'pendiente',
          paymentReference: reference,
          couponCode: coupon ? coupon.code : undefined,
        });
        if (coupon) clearCoupon();
        await redirectToWompiCheckout({
          amountInCents: Math.round(wompiTotal * 100),
          reference,
          redirectUrl: `${window.location.origin}/pedido-confirmado/${id}`,
          customerFullName: form.name,
          customerPhone: form.phone,
        });
        return;
      }

      const { id } = await createOrder({
        items,
        subtotal: finalSubtotal,
        shipping: shippingCost,
        total,
        customer: locationUrl ? { ...form, locationUrl } : form,
        paymentMethod: method,
        status: 'pendiente',
        couponCode: coupon ? coupon.code : undefined,
      });
      if (coupon) clearCoupon();
      clear();
      router.push(`/pedido-confirmado/${id}`);
    } catch (err) {
      console.error(err);
      setError('No pudimos registrar tu pedido. Por favor intenta de nuevo o escríbenos por WhatsApp.');
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setAttemptedSubmit(true);

    if (hasErrors) {
      setError('Por favor completa los campos marcados en rojo.');
      return;
    }

    await submitOrder(paymentMethod);
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-2 font-heading text-3xl font-bold text-ink">Finalizar compra</h1>
      <p className="mb-8 text-sm text-muted">Solo necesitamos unos datos para enviarte tu pedido</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Nombre completo *</label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={fieldClass('name')}
              placeholder="Ej: María Pérez"
            />
            {attemptedSubmit && fieldErrors.name && (
              <p className="mt-1 text-xs text-urgent">Escribe tu nombre completo.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Teléfono / WhatsApp *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={fieldClass('phone')}
              placeholder="Ej: 3001234567"
            />
            {attemptedSubmit && fieldErrors.phone && (
              <p className="mt-1 text-xs text-urgent">Escribe un teléfono de contacto.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Dirección de envío *</label>
            <input
              required
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className={fieldClass('address')}
              placeholder="Calle, número, barrio"
            />
            {attemptedSubmit && fieldErrors.address && (
              <p className="mt-1 text-xs text-urgent">Escribe la dirección de entrega.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Departamento *</label>
              <select
                required
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                className={classNames(fieldClass('department'), 'bg-white')}
              >
                <option value="">Selecciona...</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {attemptedSubmit && fieldErrors.department && (
                <p className="mt-1 text-xs text-urgent">Elige tu departamento.</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Municipio *</label>
              <select
                required
                disabled={!form.department}
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className={classNames(fieldClass('city'), 'bg-white disabled:opacity-50')}
              >
                <option value="">{form.department ? 'Selecciona...' : 'Elige depto. primero'}</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {attemptedSubmit && fieldErrors.city && (
                <p className="mt-1 text-xs text-urgent">Elige tu municipio.</p>
              )}
            </div>
          </div>
          {bundle.hasFreeShipping ? (
            <p className="-mt-2 text-xs font-semibold text-primary">🚚 Envío GRATIS por tu 2×1</p>
          ) : (
            form.department && (
              <p className="-mt-2 text-xs text-muted">
                🚚 Envío a {form.city || form.department}:{' '}
                <span className="font-semibold text-ink">{formatPrice(shippingCost)}</span>
              </p>
            )
          )}

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
              {isWompiConfigured() && (
                <label className="flex items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-light/10">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'wompi'}
                    onChange={() => setPaymentMethod('wompi')}
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink">
                      ⚡ Pagar en línea <span className="text-primary">— 5% de descuento adicional</span>
                    </span>
                    <span className="block text-xs text-muted">Tarjeta, PSE o Nequi, procesado por Wompi</span>
                  </span>
                </label>
              )}
            </div>
          </div>

          {error && <p className="rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{error}</p>}

          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">Aceptamos</p>
            <PaymentBadges />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={
              paymentMethod === 'wompi'
                ? 'w-full rounded-card bg-gradient-to-r from-urgent to-primary px-6 py-3.5 text-base font-bold text-white shadow-lift disabled:opacity-60'
                : 'btn-primary w-full text-base disabled:opacity-60'
            }
          >
            {submitting
              ? 'Procesando...'
              : paymentMethod === 'wompi'
                ? `⚡ Pagar ahora — ${formatPrice(wompiTotal)}`
                : `Confirmar pedido — ${formatPrice(total)}`}
          </button>
          <p className="text-center text-xs text-muted">
            {paymentMethod === 'wompi'
              ? '🔒 Pago 100% seguro procesado por Wompi'
              : '🔒 Tus datos están seguros y protegidos'}
          </p>
        </form>

        <div className="h-fit rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Tu pedido</h2>
          {bundle.pairsCount > 0 && (
            <div className="mb-4 rounded-lg bg-primary-light/15 px-3 py-2 text-xs font-bold text-primary">
              🎉 2×1 aplicado — ahorras {formatPrice(bundle.savings)}
            </div>
          )}
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
            <span className={bundle.savings > 0 ? 'line-through' : ''}>{formatPrice(bundle.subtotal)}</span>
          </div>
          {bundle.savings > 0 && (
            <div className="flex justify-between text-sm text-muted">
              <span>Con 2×1</span>
              <span className="font-semibold text-primary">{formatPrice(bundle.discountedSubtotal)}</span>
            </div>
          )}
          {coupon ? (
            <div className="flex items-center justify-between text-sm font-semibold text-primary">
              <span>🎟️ Cupón {coupon.code} (-{coupon.percent}%)</span>
              <span className="flex items-center gap-2">
                -{formatPrice(couponDiscount)}
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-normal text-muted underline hover:text-urgent"
                >
                  Quitar
                </button>
              </span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="¿Tienes un cupón?"
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim()}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs text-urgent">{couponError}</p>}
            </div>
          )}
          <div className="flex justify-between text-sm text-muted">
            <span>Envío</span>
            <span className="font-semibold text-ink">
              {bundle.hasFreeShipping ? 'GRATIS' : form.department ? formatPrice(shippingCost) : 'Elige tu ubicación'}
            </span>
          </div>
          {paymentMethod === 'wompi' && (
            <div className="flex justify-between text-sm font-semibold text-primary">
              <span>⚡ Descuento por pago en línea (-5%)</span>
              <span>-{formatPrice(finalSubtotal - wompiSubtotal)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(paymentMethod === 'wompi' ? wompiTotal : total)}</span>
          </div>
          <Link href="/carrito" className="mt-4 block text-center text-sm text-muted hover:text-primary">
            ← Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
