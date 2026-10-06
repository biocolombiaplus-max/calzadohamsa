import Link from 'next/link';
import type { Product } from '@/lib/types';
import ProductGrid from './ProductGrid';

export default function FeaturedProducts({ products }: { products: Product[] }) {
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

        <ProductGrid
          products={products}
          emptyMessage="Aún no hay productos publicados. Ingresa tus primeras sandalias desde el panel administrativo."
        />

        <div className="mt-8 text-center sm:hidden">
          <Link href="/catalogo" className="btn-secondary">
            Ver todo el catálogo →
          </Link>
        </div>
      </div>
    </section>
  );
}
