import Link from 'next/link';
import type { Product } from '@/lib/types';
import { cloudinaryFill, cloudinaryOriginal, formatPrice } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  const isFull = !!product.images[0] && product.noCropImages?.includes(product.images[0]);
  const scale = (product.images[0] ? product.imageScale?.[product.images[0]] : undefined) ?? 100;

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-card bg-white shadow-soft">
        <SafeImage
          src={product.images[0] ? (isFull ? cloudinaryOriginal(product.images[0]) : cloudinaryFill(product.images[0], 800)) : ''}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, 25vw"
          className={
            isFull
              ? 'object-contain transition-transform duration-500'
              : 'object-cover transition-transform duration-500 group-hover:scale-105'
          }
          style={isFull ? { transform: `scale(${scale / 100})` } : undefined}
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-urgent px-2.5 py-1 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white">
            ¡Últimas {product.stock}!
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="truncate text-sm font-semibold text-ink">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice as number)}</span>
          )}
        </div>
        {!!product.reviewsCount && (
          <p className="mt-1 text-xs text-muted">★★★★★ ({product.reviewsCount})</p>
        )}
      </div>
    </Link>
  );
}
