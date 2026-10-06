'use client';

import Image from 'next/image';
import { useSiteSettings } from '@/lib/settings-context';
import { cloudinaryFill } from '@/lib/utils';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

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
              <div className="mb-3 flex items-center gap-3">
                {r.photo ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-soft">
                    <Image src={cloudinaryFill(r.photo, 88)} alt={r.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light/25 text-sm font-bold text-primary-hover">
                    {initials(r.name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">{r.name}</p>
                  <p className="truncate text-[11px] text-muted">✅ Compra verificada · {r.city}</p>
                </div>
              </div>
              <p className="mb-2 text-primary">★★★★★</p>
              <p className="text-sm leading-relaxed text-ink">&ldquo;{r.review}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
