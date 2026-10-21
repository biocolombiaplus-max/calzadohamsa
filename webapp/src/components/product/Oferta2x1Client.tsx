'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { formatPrice, resolveColorImage } from '@/lib/utils';
import { useSiteSettings } from '@/lib/settings-context';
import BundleSlotPicker, { type BundleSelection } from '@/components/product/BundleSlotPicker';
import QuickBuyModal from '@/components/product/QuickBuyModal';
import { isWompiConfigured } from '@/lib/wompi';

function toCartItem(selection: BundleSelection): CartItem {
  return {
    productId: selection.product.id,
    slug: selection.product.slug,
    title: selection.product.title,
    price: selection.product.price,
    image: resolveColorImage(selection.product, selection.color) || selection.product.images[0] || '',
    size: selection.size,
    color: selection.color,
    quantity: 1,
  };
}

// El catálogo ya llega listo desde el servidor (ver page.tsx) — nada de
// "Cargando catálogo..." que se pueda quedar pegado en una conexión lenta.
export default function Oferta2x1Client({ products }: { products: Product[] }) {
  const settings = useSiteSettings();
  const [slot1, setSlot1] = useState<BundleSelection | null>(null);
  const [slot2, setSlot2] = useState<BundleSelection | null>(null);
  const [modal, setModal] = useState<'cod' | 'wompi' | null>(null);

  // Si llega desde "Elegir mi segundo par" (ver QuickBuyModal), el primer
  // par ya elegido en la ficha de producto viene en la URL — así no toca
  // volver a seleccionarlo desde cero, solo falta el segundo par.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) return;
    const product = products.find((p) => p.slug === slug);
    if (!product) return;
    const size = params.get('size') || product.sizes[0] || '';
    const color = params.get('color') || product.colors[0]?.name || '';
    setSlot1({ product, size, color });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bothSelected = !!slot1 && !!slot2;
  const bundlePrice = settings.bundle2x1.price;
  const referencePrice = slot1?.product.price ?? products[0]?.price ?? Math.round(bundlePrice / 2 + 10000);

  const { normalTotal, savings, discountedTotal, wompiTotal } = useMemo(() => {
    if (!slot1 || !slot2) {
      return { normalTotal: 0, savings: 0, discountedTotal: 0, wompiTotal: 0 };
    }
    const normal = slot1.product.price + slot2.product.price;
    const discounted = Math.min(bundlePrice, normal);
    return {
      normalTotal: normal,
      savings: normal - discounted,
      discountedTotal: discounted,
      wompiTotal: Math.round(discounted * 0.95),
    };
  }, [slot1, slot2, bundlePrice]);

  const items = bothSelected ? [toCartItem(slot1 as BundleSelection), toCartItem(slot2 as BundleSelection)] : [];
  const discountLabel = `🎉 Precio 2×1 aplicado — 2 pares por ${formatPrice(discountedTotal)}`;

  return (
    <div className="bg-cream">
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-1 bg-urgent px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            2×1 + Envío gratis — Solo por hoy
          </span>
          <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
            Lleva 2 pares por {formatPrice(bundlePrice)}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Elige modelo, talla y color de cada par — el envío corre por nuestra cuenta. Sin complicaciones.
          </p>
          <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-3 text-xs text-muted">
            <span className="border border-border bg-white px-3 py-1">1 par: {formatPrice(referencePrice)} + envío</span>
            <span className="border border-ink bg-ink px-3 py-1 font-bold text-cream">
              2 pares: {formatPrice(bundlePrice)} + envío gratis
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-center text-muted">Todavía no hay productos disponibles para esta oferta.</p>
        ) : (
          <>
            <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
              <BundleSlotPicker label="Par 1" products={products} selection={slot1} onChange={setSlot1} />
              <BundleSlotPicker label="Par 2" products={products} selection={slot2} onChange={setSlot2} />
            </div>

            {bothSelected && (
              <div className="mx-auto mt-8 max-w-md border border-ink bg-white p-6 text-center">
                {savings > 0 && <p className="text-sm text-muted line-through">{formatPrice(normalTotal)}</p>}
                <p className="font-heading text-3xl font-bold text-ink">{formatPrice(discountedTotal)}</p>
                <p className="mt-1 text-sm font-bold text-urgent">
                  {savings > 0 ? `Ahorras ${formatPrice(savings)} + envío gratis` : 'Envío gratis incluido'}
                </p>

                <div className="mt-6 space-y-3">
                  <button onClick={() => setModal('wompi')} className="btn-primary w-full flex-col gap-0.5 py-4 text-sm">
                    <span>Pagar ahora y ahorra 5% más</span>
                    <span className="block text-[11px] font-semibold normal-case tracking-normal text-cream/80">
                      Solo {formatPrice(wompiTotal)} con tarjeta, PSE o Nequi
                    </span>
                  </button>

                  <button onClick={() => setModal('cod')} className="btn-secondary w-full text-sm">
                    Pago contra entrega — {formatPrice(discountedTotal)}
                  </button>
                  <p className="text-xs text-muted">
                    Elige cómo pagar: en línea con 5% adicional de descuento, o en efectivo cuando recibas tu
                    pedido en la puerta.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal === 'cod' && (
        <QuickBuyModal
          items={items}
          totalOverride={discountedTotal}
          discountLabel={discountLabel}
          title="Confirma tu 2×1 — Pago contra entrega"
          mode="cod"
          freeShipping
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'wompi' && (
        <QuickBuyModal
          items={items}
          totalOverride={discountedTotal}
          discountLabel={discountLabel}
          title="Confirma tu 2×1 — Pago en línea"
          mode={isWompiConfigured() ? 'wompi' : 'cod'}
          freeShipping
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
