'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { classNames, cloudinaryFill, formatPrice, resolveColorImage } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

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

  // Si esta casilla arranca vacía y la selección llega después (ej: el
  // primer par ya elegido en la ficha de producto, que tarda un instante
  // en leerse de la URL), hay que cerrar la lista de elegir automáticamente
  // la PRIMERA vez que eso pasa — si no, se queda pegada mostrando la lista
  // para siempre y la clienta tiene que volver a elegir a mano algo que ya
  // había elegido. No interfiere con "Cambiar modelo" después.
  const hadSelection = useRef(!!selection);
  useEffect(() => {
    if (!hadSelection.current && selection) setPickingProduct(false);
    hadSelection.current = !!selection;
  }, [selection]);

  function selectProduct(product: Product) {
    onChange({
      product,
      size: product.sizes[0] ?? '',
      color: product.colors[0]?.name ?? '',
    });
    setPickingProduct(false);
  }

  return (
    <div className="border border-dashed border-border bg-white p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{label}</p>

      {!selection || pickingProduct ? (
        <div>
          <p className="mb-3 text-sm text-muted">Elige tu par:</p>
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {products.map((p) => (
              <button key={p.id} type="button" onClick={() => selectProduct(p)} className="group text-left">
                <div className="relative aspect-square overflow-hidden bg-cream-alt ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-ink">
                  {p.images[0] ? (
                    <SafeImage src={cloudinaryFill(p.images[0], 400)} alt={p.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">👡</div>
                  )}
                </div>
                <p className="mt-1 truncate text-[11px] font-semibold text-ink">{p.title}</p>
                <p className="text-[11px] font-bold text-ink">{formatPrice(p.price)}</p>
              </button>
            ))}
          </div>
          {selection && (
            <button
              type="button"
              onClick={() => setPickingProduct(false)}
              className="mt-3 text-xs font-semibold text-muted hover:text-ink"
            >
              ← Cancelar
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-cream-alt">
              {(() => {
                const displayImage =
                  resolveColorImage(selection.product, selection.color) || selection.product.images[0];
                return displayImage ? (
                  <SafeImage src={cloudinaryFill(displayImage, 500)} alt={selection.product.title} fill className="object-cover" />
                ) : null;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">{selection.product.title}</p>
              <p className="text-sm font-bold text-ink">{formatPrice(selection.product.price)}</p>
              <button
                type="button"
                onClick={() => setPickingProduct(true)}
                className="mt-1 text-xs font-semibold text-muted underline hover:text-ink"
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
                      'flex h-8 min-w-[32px] items-center justify-center border px-2 text-xs font-semibold',
                      selection.size === s ? 'border-ink bg-ink text-cream' : 'border-border bg-white text-ink',
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
              <div className="flex flex-wrap gap-2">
                {selection.product.colors.map((c) => {
                  const thumb = resolveColorImage(selection.product, c.name);
                  const selected = selection.color === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => onChange({ ...selection, color: c.name })}
                      aria-label={c.name}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={classNames('block h-7 w-7 rounded-full border transition-colors', selected ? 'border-ink' : 'border-border')}
                        style={{ backgroundColor: c.hex }}
                      />
                      {thumb && (
                        <span
                          className={classNames(
                            'relative block h-8 w-8 overflow-hidden border transition-colors',
                            selected ? 'border-ink' : 'border-border',
                          )}
                        >
                          <SafeImage src={cloudinaryFill(thumb, 80)} alt={c.name} fill sizes="32px" className="object-cover" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
