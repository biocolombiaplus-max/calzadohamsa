import Link from 'next/link';
import type { Product } from '@/lib/types';
import ProductGrid from './ProductGrid';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-cream py-14">
      <div className="container-page">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Las favoritas del momento</p>
            <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Las más deseadas</h2>
          </div>
          {/* Botón grande y directo — la entrada más clara al catálogo
              completo, sin tener que adivinar dónde tocar. */}
          <Link href="/catalogo" className="btn-primary w-full sm:w-auto">
            Ver catálogo completo
          </Link>
        </div>

        <ProductGrid
          products={products}
          emptyMessage="Aún no hay productos publicados. Ingresa tus primeras sandalias desde el panel administrativo."
        />

        <div className="mt-12 border-t border-border pt-10 text-center">
          <Link href="/catalogo" className="btn-primary px-10 py-4 text-base">
            Ver catálogo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
