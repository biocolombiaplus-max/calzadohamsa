import type { Product } from '@/lib/types';
import ProductGrid from '../ProductGrid';

// Ya llega listo desde el servidor (ver page.tsx) — nada de "cargando" que
// se pueda quedar pegado en una conexión lenta.
export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-cream py-14">
      <div className="container-page">
        <h2 className="mb-8 font-heading text-2xl font-bold text-ink">Completa tu look</h2>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
