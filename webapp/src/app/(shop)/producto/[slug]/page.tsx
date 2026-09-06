'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getProductBySlug } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import ProductGallery from '@/components/product/ProductGallery';
import BuyBox from '@/components/product/BuyBox';
import SocialProofTicker from '@/components/product/SocialProofTicker';
import SizeGuide from '@/components/product/SizeGuide';
import Accordion, { AccordionItem } from '@/components/product/Accordion';
import RelatedProducts from '@/components/product/RelatedProducts';
import HowItWorks from '@/components/HowItWorks';

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getProductBySlug(params.slug)
      .then((p) => !cancelled && setProduct(p))
      .catch(() => !cancelled && setProduct(null));
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (product === null) return notFound();

  if (product === undefined) {
    return (
      <div className="container-page grid gap-8 py-8 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-card" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-40 w-full rounded" />
        </div>
      </div>
    );
  }

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
            <ProductGallery images={product.images} title={product.title} discountPercent={discountPercent} />
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
              <BuyBox product={product} />
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
      </div>

      <HowItWorks />
      <RelatedProducts productId={product.id} collection={product.collection} />

      {/* Barra fija de compra en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-white p-3 shadow-lift lg:hidden">
        <div>
          <p className="text-xs text-muted">Precio</p>
          <p className="font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
        <a href="#buybox" className="btn-primary flex-1 text-center text-sm">
          Comprar ahora
        </a>
      </div>
    </div>
  );
}
