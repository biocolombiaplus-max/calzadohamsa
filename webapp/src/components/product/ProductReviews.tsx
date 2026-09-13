import type { ProductReview } from '@/lib/types';

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
            <p className="text-xs font-bold text-ink">
              {r.name}
              {r.city && <span className="font-normal text-muted"> · {r.city}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
