'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatPrice, resolveColorImage } from '@/lib/utils';
import type { Product } from '@/lib/types';
import ProductGallery from '@/components/product/ProductGallery';
import BuyBox from '@/components/product/BuyBox';
import SocialProofTicker from '@/components/product/SocialProofTicker';
import SizeGuide from '@/components/product/SizeGuide';
import Accordion, { AccordionItem } from '@/components/product/Accordion';
import ProductReviews from '@/components/product/ProductReviews';
import RelatedProducts from '@/components/product/RelatedProducts';
import HowItWorks from '@/components/HowItWorks';
import { trackPixelEvent } from '@/lib/metaPixel';
import { trackFunnelStep } from '@/lib/analytics';

// El producto ya llega listo desde el servidor (ver page.tsx) — este
// componente solo maneja la parte interactiva (galería, color elegido,
// barra fija de compra), sin ningún viaje de red ni estado de "cargando".
export default function ProductPageClient({ product }: { product: Product }) {
  const [colorImage, setColorImage] = useState<string | undefined>(() =>
    product.colors[0] ? resolveColorImage(product, product.colors[0].name) : undefined,
  );
  const [ctaVisible, setCtaVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // La barra fija de compra en móvil solo tiene sentido cuando el botón de
  // compra "real" del BuyBox no se ve — si aparecen las dos a la vez se ven
  // redundantes y hasta se tapan entre sí.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), {
      rootMargin: '0px 0px -10% 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    trackPixelEvent('ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.title,
      value: product.price,
      currency: 'COP',
    });
    trackFunnelStep('producto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  return (
    <div>
      <div className="container-page py-6 sm:py-8">
        <nav className="mb-5 text-xs text-muted sm:mb-6">
          <Link href="/" className="hover:text-primary">Inicio</Link> /{' '}
          <Link href="/catalogo" className="hover:text-primary">Catálogo</Link> /{' '}
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <ProductGallery
              images={product.images}
              title={product.title}
              discountPercent={discountPercent}
              colorImage={colorImage}
              noCropImages={product.noCropImages}
              imageScale={product.imageScale}
            />
          </div>

          <div>
            {product.collection && (
              <span className="mb-2 inline-block rounded-full bg-cream-alt px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                {product.collection}
              </span>
            )}
            <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">{product.title}</h1>
            <div className="mt-4">
              <SocialProofTicker productTitle={product.title} />
            </div>
            <div id="buybox" className="mt-5 scroll-mt-24">
              <BuyBox
                product={product}
                onColorChange={(name) => setColorImage(resolveColorImage(product, name))}
                ctaRef={ctaRef}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion>
            {product.description && (
              <AccordionItem title="📋 Detalles del producto" defaultOpen>
                <p className="whitespace-pre-line">{product.description}</p>
              </AccordionItem>
            )}
            <AccordionItem title="📏 Guía de tallas — Encuentra la tuya">
              <SizeGuide />
            </AccordionItem>
            <AccordionItem title="🚚 Envíos y cambios">
              <ul className="space-y-2">
                <li>• Envío calculado según tu departamento y municipio al finalizar la compra.</li>
                <li>• Llevando 2 pares (cualquier modelo, talla o color) el envío es GRATIS.</li>
                <li>• Pagas cuando recibes tu pedido — sin tarjeta, sin anticipo.</li>
                <li>• Despacho en 24-48 horas hábiles desde que confirmamos tu pedido.</li>
                <li>• Primer cambio de talla sin costo si no te queda perfecta.</li>
              </ul>
            </AccordionItem>
          </Accordion>
        </div>

        <ProductReviews reviews={product.reviews ?? []} />
      </div>

      <HowItWorks />
      <RelatedProducts productId={product.id} collection={product.collection} />

      {/* Barra fija de compra en móvil — solo aparece cuando el botón real
          de compra del BuyBox no está a la vista, para no duplicar el CTA */}
      {!ctaVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-white p-3 shadow-lift lg:hidden">
          <div>
            <p className="text-xs text-muted">Precio</p>
            <p className="font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
          <a href="#buybox" className="btn-primary flex-1 text-center text-sm">
            Comprar ahora
          </a>
        </div>
      )}
    </div>
  );
}
