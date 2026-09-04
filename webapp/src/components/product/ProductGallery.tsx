'use client';

import Image from 'next/image';
import { useState } from 'react';
import { classNames } from '@/lib/utils';

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const gallery = images.length > 0 ? images : ['/hero-placeholder.svg'];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-cream-alt shadow-soft">
        <Image src={gallery[active]} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={classNames(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2',
                active === i ? 'border-primary' : 'border-transparent',
              )}
            >
              <Image src={src} alt={`${title} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
