'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getActiveProducts } from '@/lib/products';
import { createOrder } from '@/lib/orders';
import { getSiteSettings } from '@/lib/settings';
import { getDepartamentos, getMunicipios } from '@/lib/colombia';
import { getShippingRate } from '@/lib/shipping';
import { computeBundlePricing } from '@/lib/bundle';
import { formatPrice, classNames } from '@/lib/utils';
import type { CartItem, PaymentMethod, Product, ShippingSettings } from '@/lib/types';

const EMPTY_SHIPPING: ShippingSettings = { defaultRate: 15000, rates: [], exceptions: [] };

const DEPARTAMENTOS = getDepartamentos();

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'contra_entrega', label: '💵 Contra entrega' },
  { value: 'transferencia', label: '🏦 Transferencia bancaria' },
  { value: 'wompi', label: '⚡ Ya pagó en línea (Wompi)' },
];

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(EMPTY_SHIPPING);
  const [bundlePrice, setBundlePrice] = useState(169900);

  const [pickProductId, setPickProductId] = useState('');
  const [pickSize, setPickSize] = useState('');
  const [pickColor, setPickColor] = useState('');
  const [pickQty, setPickQty] = useState(1);

  const [form, setForm] = useState({ name: '', phone: '', address: '', department: '', city: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('contra_entrega');
  const [shippingOverride, setShippingOverride] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getActiveProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    getSiteSettings()
      .then((s) => {
        setShippingSettings(s.shipping);
        setBundlePrice(s.bundle2x1.price);
      })
      .catch(() => {});
  }, []);

  const pickedProduct = products?.find((p) => p.id === pickProductId);
  const municipios = useMemo(() => getMunicipios(form.department), [form.department]);

  const bundle = useMemo(() => computeBundlePricing(items, bundlePrice), [items, bundlePrice]);
  const autoShipping = form.department
    ? getShippingRate(shippingSettings, form.department, form.city)
    : shippingSettings.defaultRate;
  const shippingCost = shippingOverride !== '' ? Number(shippingOverride) : bundle.hasFreeShipping ? 0 : autoShipping;
  const total = bundle.discountedSubtotal + shippingCost;

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => (key === 'department' ? { ...f, department: value, city: '' } : { ...f, [key]: value }));
  }

  function handleAddItem() {
    if (!pickedProduct || !pickSize || !pickColor) return;
    setItems((prev) => [
      ...prev,
      {
        productId: pickedProduct.id,
        slug: pickedProduct.slug,
        title: pickedProduct.title,
        price: pickedProduct.price,
        image: pickedProduct.images[0] ?? '',
        size: pickSize,
        color: pickColor,
        quantity: pickQty,
      },
    ]);
    setPickProductId('');
    setPickSize('');
    setPickColor('');
    setPickQty(1);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.department || !form.city) {
      setError('Completa el nombre, teléfono, dirección, departamento y municipio de la clienta.');
      return;
    }

    setSaving(true);
    try {
      const { id } = await createOrder({
        items,
        subtotal: bundle.discountedSubtotal,
        shipping: shippingCost,
        total,
        customer: { ...form },
        paymentMethod,
        status: 'confirmado',
      });
      router.push('/admin/pedidos');
      router.refresh();
      void id;
    } catch {
      setError('No se pudo crear el pedido. Intenta de nuevo.');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/pedidos" className="mb-4 inline-block text-sm font-semibold text-muted hover:text-primary">
        ← Volver a pedidos
      </Link>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Crear pedido manual</h1>
      <p className="mb-6 text-sm text-muted">
        Para pedidos que te llegaron por WhatsApp, Instagram o en persona — queda registrado igual que uno hecho
        desde la tienda, ya confirmado.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Productos</h2>

          {items.length > 0 && (
            <ul className="mb-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="text-sm">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-xs text-muted">
                      Talla {item.size} · {item.color} · x{item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(i)}
                      className="text-xs font-semibold text-urgent"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 rounded-lg bg-cream-alt/50 p-4 sm:grid-cols-2">
            <select
              value={pickProductId}
              onChange={(e) => {
                setPickProductId(e.target.value);
                setPickSize('');
                setPickColor('');
              }}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none sm:col-span-2"
            >
              <option value="">
                {products === null ? 'Cargando productos...' : 'Selecciona un producto'}
              </option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatPrice(p.price)}
                </option>
              ))}
            </select>

            <select
              value={pickSize}
              onChange={(e) => setPickSize(e.target.value)}
              disabled={!pickedProduct}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="">Talla</option>
              {pickedProduct?.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={pickColor}
              onChange={(e) => setPickColor(e.target.value)}
              disabled={!pickedProduct}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="">Color</option>
              {pickedProduct?.colors.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted">Cantidad</label>
              <input
                type="number"
                min={1}
                value={pickQty}
                onChange={(e) => setPickQty(Math.max(1, Number(e.target.value)))}
                className="w-20 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!pickedProduct || !pickSize || !pickColor}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
            >
              + Agregar al pedido
            </button>
          </div>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Datos de la clienta</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Nombre completo *</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
                placeholder="Ej: María Pérez"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Teléfono / WhatsApp *</label>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-ink">Dirección de envío *</label>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
              placeholder="Calle, número, barrio"
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Departamento *</label>
              <select
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 focus:border-primary focus:outline-none"
              >
                <option value="">Selecciona...</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Municipio *</label>
              <select
                value={form.city}
                disabled={!form.department}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 focus:border-primary focus:outline-none disabled:opacity-50"
              >
                <option value="">{form.department ? 'Selecciona...' : 'Elige depto. primero'}</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-ink">Nota (opcional)</label>
            <textarea
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Pago y envío</h2>
          <div className="mb-4 space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={classNames(
                  'flex items-center gap-3 rounded-lg border p-3 text-sm',
                  paymentMethod === opt.value ? 'border-primary bg-primary-light/10' : 'border-border',
                )}
              >
                <input
                  type="radio"
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          <label className="mb-1 block text-sm font-semibold text-ink">
            Costo de envío {bundle.hasFreeShipping && '(GRATIS por 2×1 — puedes ajustarlo si quieres)'}
          </label>
          <input
            type="number"
            min={0}
            value={shippingOverride !== '' ? shippingOverride : shippingCost}
            onChange={(e) => setShippingOverride(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className={bundle.savings > 0 ? 'line-through' : ''}>{formatPrice(bundle.subtotal)}</span>
          </div>
          {bundle.savings > 0 && (
            <div className="flex justify-between text-sm text-muted">
              <span>Con 2×1</span>
              <span className="font-semibold text-primary">{formatPrice(bundle.discountedSubtotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted">
            <span>Envío</span>
            <span>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p className="rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
          {saving ? 'Guardando...' : 'Crear pedido'}
        </button>
      </form>
    </div>
  );
}
