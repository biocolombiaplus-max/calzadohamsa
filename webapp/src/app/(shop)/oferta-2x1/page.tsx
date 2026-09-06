'use client';

import { useEffect, useMemo, useState } from 'react';
import { getActiveProducts } from '@/lib/products';
import type { Product, CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useSiteSettings } from '@/lib/settings-context';
import BundleSlotPicker, { type BundleSelection } from '@/components/product/BundleSlotPicker';
import UrgencyTimer from '@/components/product/UrgencyTimer';
import QuickBuyModal from '@/components/product/QuickBuyModal';
import { isWompiConfigured } from '@/lib/wompi';

function toCartItem(selection: BundleSelection): CartItem {
  return {
    productId: selection.product.id,
    slug: selection.product.slug,
    title: selection.product.title,
    price: selection.product.price,
    image: selection.product.images[0] ?? '',
    size: selection.size,
    color: selection.color,
    quantity: 1,
  };
}

export default function Oferta2x1Page() {
  const settings = useSiteSettings();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [slot1, setSlot1] = useState<BundleSelection | null>(null);
  const [slot2, setSlot2] = useState<BundleSelection | null>(null);
  const [modal, setModal] = useState<'cod' | 'wompi' | null>(null);

  useEffect(() => {
    getActiveProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const bothSelected = !!slot1 && !!slot2;
  const bundlePrice = settings.bundle2x1.price;
  const referencePrice = slot1?.product.price ?? products?.[0]?.price ?? Math.round(bundlePrice / 2 + 10000);

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
          <span className="mb-3 inline-flex animate-pulseSoft items-center gap-1 rounded-full bg-urgent px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">
            🔥 2×1 + Envío GRATIS — Solo por hoy
          </span>
          <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
            Lleva 2 pares por {formatPrice(bundlePrice)}
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Elige modelo, talla y color de cada par — el envío corre por nuestra cuenta. Sin complicaciones.
          </p>
          <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-3 text-xs text-muted">
            <span className="rounded-full border border-border bg-white px-3 py-1">
              1 par: {formatPrice(referencePrice)} + envío
            </span>
            <span className="rounded-full bg-primary-light/20 px-3 py-1 font-bold text-primary">
              2 pares: {formatPrice(bundlePrice)} + envío GRATIS
            </span>
          </div>
          <div className="mx-auto mt-5 max-w-sm">
            <UrgencyTimer initialMinutes={14} />
          </div>
        </div>

        {products === null ? (
          <p className="mt-10 text-center text-muted">Cargando catálogo...</p>
        ) : products.length === 0 ? (
          <p className="mt-10 text-center text-muted">Todavía no hay productos disponibles para esta oferta.</p>
        ) : (
          <>
            <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
              <BundleSlotPicker label="Par 1" products={products} selection={slot1} onChange={setSlot1} />
              <BundleSlotPicker label="Par 2" products={products} selection={slot2} onChange={setSlot2} />
            </div>

            {bothSelected && (
              <div className="mx-auto mt-8 max-w-md rounded-card border-2 border-primary bg-white p-6 text-center shadow-lift">
                {savings > 0 && <p className="text-sm text-muted line-through">{formatPrice(normalTotal)}</p>}
                <p className="font-heading text-3xl font-bold text-primary">{formatPrice(discountedTotal)}</p>
                <p className="mt-1 text-sm font-bold text-urgent">
                  {savings > 0 ? `¡Ahorras ${formatPrice(savings)}! + envío gratis` : '¡Envío gratis incluido!'}
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setModal('wompi')}
                    className="relative w-full overflow-hidden rounded-card bg-gradient-to-r from-urgent to-primary px-6 py-4 text-base font-bold text-white shadow-lift transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                    <span className="relative block">⚡ Pagar ahora y ahorra 5% más</span>
                    <span className="relative block text-sm font-semibold opacity-90">
                      Solo {formatPrice(wompiTotal)} con tarjeta, PSE o Nequi
                    </span>
                  </button>

                  <button
                    onClick={() => setModal('cod')}
                    className="btn-secondary w-full text-base"
                  >
                    💵 Pago contra entrega — {formatPrice(discountedTotal)}
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
          title="💵 Confirma tu 2×1 — Pago contra entrega"
          mode="cod"
          freeShipping
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'wompi' && (
        <QuickBuyModal
          items={items}
          totalOverride={wompiTotal}
          discountLabel={`${discountLabel} + 5% adicional por pago en línea`}
          title="⚡ Confirma tu 2×1 — Pago en línea"
          mode={isWompiConfigured() ? 'wompi' : 'cod'}
          freeShipping
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
