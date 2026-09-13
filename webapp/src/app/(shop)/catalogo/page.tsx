'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getActiveProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import ProductGrid from '@/components/ProductGrid';

type SortOption = 'relevancia' | 'precio_asc' | 'precio_desc' | 'vendidos' | 'nuevo';

const SORT_LABELS: Record<SortOption, string> = {
  relevancia: 'Relevancia',
  nuevo: 'Más recientes',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
  vendidos: 'Más vendidos',
};

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'precio_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'precio_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'vendidos':
      return sorted.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    case 'nuevo':
      return sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const isOffer = searchParams.get('oferta') === '2x1';
  const collectionParam = searchParams.get('collection');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>(collectionParam ?? 'todas');
  const [sort, setSort] = useState<SortOption>('relevancia');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
    let base = activeCollection === 'todas' ? products : products.filter((p) => p.collection === activeCollection);
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !Number.isNaN(min)) base = base.filter((p) => p.price >= min);
    if (max !== null && !Number.isNaN(max)) base = base.filter((p) => p.price <= max);
    return sortProducts(base, sort);
  }, [products, activeCollection, sort, minPrice, maxPrice]);

  const hasPriceFilter = minPrice !== '' || maxPrice !== '';

  return (
    <div className="container-page py-10">
      {isOffer && (
        <div className="mb-6 rounded-card bg-urgent/10 p-4 text-center text-sm font-bold text-urgent">
          🔥 Oferta 2×1 activa — Agrega 2 pares al carrito y aplica tu descuento en el checkout
        </div>
      )}

      <nav className="mb-3 text-xs text-muted">
        <Link href="/" className="hover:text-primary">Inicio</Link> /{' '}
        {activeCollection === 'todas' ? (
          <span className="text-ink">Catálogo</span>
        ) : (
          <>
            <Link href="/catalogo" onClick={() => setActiveCollection('todas')} className="hover:text-primary">
              Catálogo
            </Link>{' '}
            / <span className="capitalize text-ink">{activeCollection}</span>
          </>
        )}
      </nav>

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

      {products !== null && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <span className="hidden sm:inline">Precio</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Desde"
                className="w-20 rounded-lg border border-border bg-white px-2 py-2 text-sm focus:border-primary focus:outline-none sm:w-24"
              />
              <span>—</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Hasta"
                className="w-20 rounded-lg border border-border bg-white px-2 py-2 text-sm focus:border-primary focus:outline-none sm:w-24"
              />
              {hasPriceFilter && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Ordenar por
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
