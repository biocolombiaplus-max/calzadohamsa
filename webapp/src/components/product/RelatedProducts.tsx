'use client';

import { useEffect, useState } from 'react';
import { getRelatedProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import ProductGrid from '../ProductGrid';

export default function RelatedProducts({ productId, collection }: { productId: string; collection: string }) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRelatedProducts(productId, collection, 4)
      .then((list) => !cancelled && setProducts(list))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [productId, collection]);

  if (products !== null && products.length === 0) return null;

  return (
    <section className="border-t border-border bg-cream py-14">
      <div className="container-page">
        <h2 className="mb-8 font-heading text-2xl font-bold text-ink">Completa tu look</h2>
        {products === null ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-card" />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}
