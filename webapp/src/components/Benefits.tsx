'use client';

import Image from 'next/image';
import { useSiteSettings } from '@/lib/settings-context';
import { cloudinaryFill } from '@/lib/utils';

export default function Benefits() {
  const { benefitsHeading, benefits } = useSiteSettings();

  return (
    <section className="bg-cream py-14">
      <div className="container-page">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">{benefitsHeading}</h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="overflow-hidden rounded-card bg-white text-center shadow-soft">
              {b.image ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image src={cloudinaryFill(b.image, 500)} alt={b.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="pt-6 text-3xl">{b.icon}</div>
              )}
              <div className="p-5 pt-4">
                <h3 className="mb-1 text-sm font-bold text-ink">{b.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
