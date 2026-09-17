'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { classNames } from '@/lib/utils';

export default function ProductGallery({
  images,
  title,
  discountPercent = 0,
  colorImage,
}: {
  images: string[];
  title: string;
  discountPercent?: number;
  colorImage?: string;
}) {
  const gallery = useMemo(() => (images.length > 0 ? images : ['/hero-placeholder.svg']), [images]);
  const [active, setActive] = useState(() => (colorImage ? Math.max(0, gallery.indexOf(colorImage)) : 0));
  // Muchas fotos vienen en formato vertical (tipo redes sociales) y al
  // recortarlas a cuadrado ("cover") se le corta un pedazo a la sandalia —
  // este botón deja verla completa ("contain", con el fondo detrás) cuando
  // haga falta, sin perder el encuadre recortado por defecto en las fotos
  // que sí quedan bien cuadradas.
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');

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
      <div className="relative aspect-square overflow-hidden rounded-card bg-cream-alt shadow-soft">
        <Image
          src={gallery[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={fit === 'cover' ? 'object-cover' : 'object-contain'}
        />
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-urgent px-3 py-1.5 text-sm font-extrabold text-white shadow-soft">
            -{discountPercent}%
          </span>
        )}
        <button
          type="button"
          onClick={() => setFit((f) => (f === 'cover' ? 'contain' : 'cover'))}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink shadow-soft transition-transform hover:scale-105 active:scale-95"
        >
          {fit === 'cover' ? '⛶ Ver sandalia completa' : '⤢ Ver recortada'}
        </button>
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
