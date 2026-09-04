'use client';

import { useSiteSettings } from '@/lib/settings-context';

export default function Benefits() {
  const { benefitsHeading, benefits } = useSiteSettings();

  return (
    <section className="bg-cream py-14">
      <div className="container-page">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">{benefitsHeading}</h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-card bg-white p-6 text-center shadow-soft">
              <div className="mb-3 text-3xl">{b.icon}</div>
              <h3 className="mb-1 text-sm font-bold text-ink">{b.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
