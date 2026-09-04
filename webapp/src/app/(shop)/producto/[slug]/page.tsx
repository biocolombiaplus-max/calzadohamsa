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
import RelatedProducts from '@/components/product/RelatedProducts';
import HowItWorks from '@/components/HowItWorks';
import TrustBar from '@/components/TrustBar';

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

  return (
    <div>
      <TrustBar />

      <div className="container-page py-8">
        <nav className="mb-6 text-xs text-muted">
          <Link href="/" className="hover:text-primary">Inicio</Link> /{' '}
          <Link href="/catalogo" className="hover:text-primary">Catálogo</Link> /{' '}
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">{product.title}</h1>
            <div className="mt-4">
              <SocialProofTicker productTitle={product.title} />
            </div>
            <div id="buybox" className="mt-5 scroll-mt-24">
              <BuyBox product={product} />
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="mb-3 font-heading text-xl font-bold text-ink">Detalles del producto</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-3xl">
          <SizeGuide />
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
