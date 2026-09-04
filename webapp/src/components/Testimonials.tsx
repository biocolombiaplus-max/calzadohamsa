'use client';

import { useSiteSettings } from '@/lib/settings-context';

export default function Testimonials() {
  const { testimonialsHeading, testimonialsSubtext, testimonials } = useSiteSettings();

  return (
    <section className="bg-white py-14">
      <div className="container-page">
        <h2 className="mb-2 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
          {testimonialsHeading}
        </h2>
        <p className="mb-8 text-center text-sm text-muted">{testimonialsSubtext}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((r, i) => (
            <div key={`${r.name}-${i}`} className="rounded-card border border-border bg-cream p-5">
              <p className="mb-3 text-primary">★★★★★</p>
              <p className="mb-4 text-sm leading-relaxed text-ink">&ldquo;{r.review}&rdquo;</p>
              <p className="text-xs font-bold text-ink">{r.name}</p>
              <p className="text-xs text-muted">✅ Compra verificada · {r.city}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
