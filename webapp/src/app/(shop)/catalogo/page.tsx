'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActiveProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import ProductGrid from '@/components/ProductGrid';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const isOffer = searchParams.get('oferta') === '2x1';
  const collectionParam = searchParams.get('collection');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>(collectionParam ?? 'todas');

  useEffect(() => {
    if (collectionParam) setActiveCollection(collectionParam);
  }, [collectionParam]);

  useEffect(() => {
    let cancelled = false;
    getActiveProducts()
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const collections = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.collection)));
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeCollection === 'todas') return products;
    return products.filter((p) => p.collection === activeCollection);
  }, [products, activeCollection]);

  return (
    <div className="container-page py-10">
      {isOffer && (
        <div className="mb-6 rounded-card bg-urgent/10 p-4 text-center text-sm font-bold text-urgent">
          🔥 Oferta 2×1 activa — Agrega 2 pares al carrito y aplica tu descuento en el checkout
        </div>
      )}

      <h1 className="font-heading text-3xl font-bold text-ink">Catálogo</h1>
      <p className="mt-1 text-sm text-muted">Encuentra tu sandalia perfecta entre toda la colección</p>

      {collections.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCollection('todas')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeCollection === 'todas' ? 'bg-primary text-white' : 'bg-white text-ink border border-border'
            }`}
          >
            Todas
          </button>
          {collections.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCollection(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                activeCollection === c ? 'bg-primary text-white' : 'bg-white text-ink border border-border'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {products === null ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-card" />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={filtered}
            emptyMessage="Todavía no hay productos en esta categoría. Ingresa productos desde el panel administrativo."
          />
        )}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="container-page py-10 text-center text-muted">Cargando catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}
