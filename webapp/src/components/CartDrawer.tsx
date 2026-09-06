'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';
import { computeBundlePricing } from '@/lib/bundle';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, close, removeItem, updateQuantity } = useCartStore();
  const settings = useSiteSettings();
  const bundle = computeBundlePricing(items, settings.bundle2x1.price);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/50" onClick={close} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-lift">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-ink">Tu carrito ({items.length})</h2>
          <button onClick={close} aria-label="Cerrar" className="text-2xl leading-none text-ink">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted">
              <p className="mb-4 text-5xl">🛍️</p>
              <p className="font-semibold text-ink">Tu carrito está vacío</p>
              <p className="mt-1 text-sm">Explora nuestros modelos y encuentra tu favorita</p>
              <Link href="/catalogo" onClick={close} className="btn-primary mt-5">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 rounded-card bg-white p-3 shadow-soft">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card bg-cream-alt">
                    {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <p className="text-xs text-muted">
                        Talla {item.size} · {item.color}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm"
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    aria-label="Quitar"
                    className="self-start text-muted hover:text-urgent"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            {bundle.pairsCount > 0 && (
              <div className="mb-3 rounded-lg bg-primary-light/15 px-3 py-2 text-xs font-bold text-primary">
                🎉 2×1 aplicado — ahorras {formatPrice(bundle.savings)} + envío gratis
              </div>
            )}
            {bundle.savings > 0 && (
              <div className="mb-1 flex items-center justify-between text-sm text-muted line-through">
                <span>Subtotal</span>
                <span>{formatPrice(bundle.subtotal)}</span>
              </div>
            )}
            <div className="mb-3 flex items-center justify-between text-base font-bold text-ink">
              <span>Total</span>
              <span className={bundle.savings > 0 ? 'text-primary' : ''}>
                {formatPrice(bundle.discountedSubtotal)}
              </span>
            </div>
            <p className="mb-3 text-xs text-muted">
              {bundle.hasFreeShipping ? '🚚 Envío GRATIS por tu 2×1' : 'Envío calculado en el checkout según tu ciudad'}
            </p>
            <Link href="/checkout" onClick={close} className="btn-primary w-full">
              Finalizar compra →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
