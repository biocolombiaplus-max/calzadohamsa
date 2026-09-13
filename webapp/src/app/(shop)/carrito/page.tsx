'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';
import { computeBundlePricing } from '@/lib/bundle';
import { buildCartWhatsAppMessage, formatPrice, whatsappLinkTo } from '@/lib/utils';
import { getDepartamentos, getMunicipios } from '@/lib/colombia';
import { getShippingRate } from '@/lib/shipping';

const DEPARTAMENTOS = getDepartamentos();

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity } = useCartStore();
  const settings = useSiteSettings();
  const bundle = computeBundlePricing(items, settings.bundle2x1.price);
  const [department, setDepartment] = useState('');
  const [municipio, setMunicipio] = useState('');
  const municipios = getMunicipios(department);
  const estimatedShipping = department ? getShippingRate(settings.shipping, department, municipio) : null;
  const estimatedTotal = bundle.discountedSubtotal + (bundle.hasFreeShipping ? 0 : estimatedShipping ?? 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const oneAwayFromBundle = totalUnits > 0 && totalUnits % 2 === 1;

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-4 text-6xl">🛍️</p>
        <h1 className="font-heading text-2xl font-bold text-ink">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-muted">Explora nuestros modelos y encuentra tu favorita</p>
        <Link href="/catalogo" className="btn-primary mt-6">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-heading text-3xl font-bold text-ink">Tu carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 rounded-card bg-white p-4 shadow-soft"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card bg-cream-alt">
                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-sm text-muted">
                      Talla {item.size} · {item.color}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="h-fit text-muted hover:text-urgent"
                    aria-label="Quitar"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Resumen</h2>
          {bundle.pairsCount > 0 && (
            <div className="mb-3 rounded-lg bg-primary-light/15 px-3 py-2 text-xs font-bold text-primary">
              🎉 2×1 aplicado — ahorras {formatPrice(bundle.savings)}
            </div>
          )}
          {oneAwayFromBundle && (
            <Link
              href="/catalogo"
              className="mb-3 block rounded-lg bg-urgent/10 px-3 py-2 text-xs font-bold text-urgent hover:bg-urgent/15"
            >
              🔥 ¡Agrega 1 par más y activa el 2×1 con envío gratis!
            </Link>
          )}
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
            <span className="font-semibold text-primary">
              {bundle.hasFreeShipping ? 'GRATIS' : estimatedShipping !== null ? formatPrice(estimatedShipping) : 'Calcula abajo'}
            </span>
          </div>

          {!bundle.hasFreeShipping && (
            <div className="mt-3 rounded-lg bg-cream-alt p-3">
              <p className="mb-2 text-xs font-semibold text-ink">📍 Calcula tu envío</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setMunicipio('');
                  }}
                  className="w-full rounded-lg border border-border bg-white px-2 py-2 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="">Departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={municipio}
                  disabled={!department}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-2 py-2 text-xs focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  <option value="">Municipio</option>
                  {municipios.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
            <span>Total {estimatedShipping !== null && !bundle.hasFreeShipping ? 'estimado' : ''}</span>
            <span>{formatPrice(estimatedTotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Finalizar compra →
          </Link>
          <a
            href={whatsappLinkTo(settings.whatsappNumber, buildCartWhatsAppMessage(items), settings.whatsappCountryCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-xs font-semibold text-whatsapp hover:underline"
          >
            💬 O termina tu compra por WhatsApp
          </a>
          <Link href="/catalogo" className="mt-3 block text-center text-sm text-muted hover:text-primary">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
