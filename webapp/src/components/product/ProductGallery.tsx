'use client';

import { useEffect, useMemo, useState } from 'react';
import { classNames, cloudinaryFill, cloudinaryOriginal } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

export default function ProductGallery({
  images,
  title,
  discountPercent = 0,
  colorImage,
  noCropImages = [],
  imageScale = {},
}: {
  images: string[];
  title: string;
  discountPercent?: number;
  colorImage?: string;
  noCropImages?: string[];
  imageScale?: Record<string, number>;
}) {
  const gallery = useMemo(() => (images.length > 0 ? images : ['/hero-placeholder.svg']), [images]);
  const [active, setActive] = useState(() => (colorImage ? Math.max(0, gallery.indexOf(colorImage)) : 0));

  // Cuando el color elegido en BuyBox tiene una foto asignada, la galería
  // salta a esa foto — igual que en las tiendas grandes — sin impedir que
  // la clienta siga navegando manualmente por las demás fotos después.
  useEffect(() => {
    if (!colorImage) return;
    const index = gallery.indexOf(colorImage);
    if (index >= 0) setActive(index);
  }, [colorImage, gallery]);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-white shadow-soft">
        <SafeImage
          src={
            noCropImages.includes(gallery[active])
              ? cloudinaryOriginal(gallery[active])
              : cloudinaryFill(gallery[active], 1000)
          }
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={noCropImages.includes(gallery[active]) ? 'object-contain' : 'object-cover'}
          style={
            noCropImages.includes(gallery[active])
              ? { transform: `scale(${(imageScale[gallery[active]] ?? 100) / 100})` }
              : undefined
          }
        />
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-urgent px-3 py-1.5 text-sm font-extrabold text-white shadow-soft">
            -{discountPercent}%
          </span>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={classNames(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white',
                active === i ? 'border-primary' : 'border-transparent',
              )}
            >
              <SafeImage
                src={noCropImages.includes(src) ? cloudinaryOriginal(src) : cloudinaryFill(src, 200)}
                alt={`${title} ${i + 1}`}
                fill
                className={noCropImages.includes(src) ? 'object-contain' : 'object-cover'}
                style={
                  noCropImages.includes(src)
                    ? { transform: `scale(${(imageScale[src] ?? 100) / 100})` }
                    : undefined
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
