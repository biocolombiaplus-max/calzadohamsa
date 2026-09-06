'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { classNames, formatPrice } from '@/lib/utils';

export interface BundleSelection {
  product: Product;
  size: string;
  color: string;
}

export default function BundleSlotPicker({
  label,
  products,
  selection,
  onChange,
}: {
  label: string;
  products: Product[];
  selection: BundleSelection | null;
  onChange: (selection: BundleSelection | null) => void;
}) {
  const [pickingProduct, setPickingProduct] = useState(!selection);

  function selectProduct(product: Product) {
    onChange({
      product,
      size: product.sizes[0] ?? '',
      color: product.colors[0]?.name ?? '',
    });
    setPickingProduct(false);
  }

  return (
    <div className="rounded-card border-2 border-dashed border-border bg-white p-4">
      <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-primary">{label}</p>

      {!selection || pickingProduct ? (
        <div>
          <p className="mb-3 text-sm text-muted">Elige tu par:</p>
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProduct(p)}
                className="group text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-alt ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-primary">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">👡</div>
                  )}
                </div>
                <p className="mt-1 truncate text-[11px] font-semibold text-ink">{p.title}</p>
                <p className="text-[11px] font-bold text-primary">{formatPrice(p.price)}</p>
              </button>
            ))}
          </div>
          {selection && (
            <button
              type="button"
              onClick={() => setPickingProduct(false)}
              className="mt-3 text-xs font-semibold text-muted hover:text-primary"
            >
              ← Cancelar
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-alt">
              {selection.product.images[0] && (
                <Image src={selection.product.images[0]} alt={selection.product.title} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">{selection.product.title}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(selection.product.price)}</p>
              <button
                type="button"
                onClick={() => setPickingProduct(true)}
                className="mt-1 text-xs font-semibold text-muted underline hover:text-primary"
              >
                Cambiar modelo
              </button>
            </div>
          </div>

          {selection.product.sizes.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-ink">Talla</p>
              <div className="flex flex-wrap gap-1.5">
                {selection.product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...selection, size: s })}
                    className={classNames(
                      'flex h-8 min-w-[32px] items-center justify-center rounded-md border-2 px-2 text-xs font-semibold',
                      selection.size === s ? 'border-primary bg-primary text-white' : 'border-border bg-white text-ink',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selection.product.colors.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-ink">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {selection.product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onChange({ ...selection, color: c.name })}
                    aria-label={c.name}
                    className={classNames(
                      'h-7 w-7 rounded-full border-2 transition-transform',
                      selection.color === c.name ? 'scale-110 border-primary' : 'border-border',
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
