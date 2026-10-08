import type { ProductReview } from '@/lib/types';
import { cloudinaryFill } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

export default function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div id="resenas" className="mx-auto mt-12 max-w-3xl scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-heading text-xl font-bold text-ink">Reseñas de clientas</h2>
        <span className="flex items-center gap-1 text-sm text-muted">
          <span className="text-primary">{'★'.repeat(Math.round(average))}</span>
          {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-card border border-border bg-white p-5 shadow-soft">
            <p className="mb-2 text-primary">
              {'★'.repeat(r.rating)}
              <span className="text-border">{'★'.repeat(5 - r.rating)}</span>
            </p>
            <p className="mb-3 text-sm leading-relaxed text-ink">&ldquo;{r.text}&rdquo;</p>
            {!!r.photos?.length && (
              <div className="mb-3 flex flex-wrap gap-2">
                {r.photos.map((url, j) => (
                  <span key={j} className="relative h-16 w-16 overflow-hidden rounded-lg bg-cream-alt">
                    <SafeImage src={cloudinaryFill(url, 128)} alt={`Foto de la reseña de ${r.name}`} fill className="object-cover" />
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs font-bold text-ink">
              {r.name}
              {r.city && <span className="font-normal text-muted"> · {r.city}</span>}
              <span className="ml-1.5 font-normal text-whatsapp">✓ Compra verificada</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
