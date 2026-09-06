'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';
import { computeBundlePricing } from '@/lib/bundle';
import { formatPrice } from '@/lib/utils';

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity } = useCartStore();
  const settings = useSiteSettings();
  const bundle = computeBundlePricing(items, settings.bundle2x1.price);

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
              {bundle.hasFreeShipping ? 'GRATIS' : 'Se calcula en el checkout'}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(bundle.discountedSubtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Finalizar compra →
          </Link>
          <Link href="/catalogo" className="mt-3 block text-center text-sm text-muted hover:text-primary">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
