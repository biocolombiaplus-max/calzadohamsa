import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyMessage = 'No hay productos disponibles todavía.' }: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
