'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedProducts, getActiveProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import ProductGrid from './ProductGrid';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let list = await getFeaturedProducts(8);
        if (list.length === 0) {
          list = (await getActiveProducts()).slice(0, 8);
        }
        if (!cancelled) setProducts(list);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-cream py-14">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Las favoritas del momento</p>
            <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Las más deseadas</h2>
          </div>
          <Link href="/catalogo" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">
            Ver todo el catálogo →
          </Link>
        </div>

        {products === null ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-square rounded-card" />
                <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                <div className="skeleton mt-2 h-4 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            emptyMessage="Aún no hay productos publicados. Ingresa tus primeras sandalias desde el panel administrativo."
          />
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/catalogo" className="btn-secondary">
            Ver todo el catálogo →
          </Link>
        </div>
      </div>
    </section>
  );
}
