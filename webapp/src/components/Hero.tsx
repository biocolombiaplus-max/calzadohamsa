'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/lib/settings-context';
import { classNames } from '@/lib/utils';

const ROTATE_MS = 4500;

// Si el admin subió varias fotos, van rotando solas cada pocos segundos
// (con un cruce suave entre una y otra) para mostrar más modelos sin que
// la clienta tenga que hacer nada — si solo hay una foto, se queda fija.
function useRotatingIndex(length: number): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    setIndex(0);
    const id = setInterval(() => setIndex((i) => (i + 1) % length), ROTATE_MS);
    return () => clearInterval(id);
  }, [length]);
  return index;
}

const TITLE_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-3xl sm:text-4xl lg:text-5xl',
  md: 'text-4xl sm:text-5xl lg:text-6xl',
  lg: 'text-5xl sm:text-6xl lg:text-7xl',
  xl: 'text-6xl sm:text-7xl lg:text-8xl',
};

const SUBTEXT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm sm:text-base',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
};

// Foto a todo el ancho con la tipografía superpuesta encima (estilo
// Maraldo / marcas de moda premium) en vez del layout anterior en dos
// columnas — esta es la primera sección de la portada.
export default function Hero() {
  const { hero, storeName } = useSiteSettings();
  const images = hero.images.length > 0 ? hero.images : ['/hero-placeholder.svg'];
  const activeIndex = useRotatingIndex(images.length);

  return (
    <section className="relative w-full overflow-hidden bg-ink">
      <div className="relative aspect-[3/4] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {images.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={storeName}
            fill
            unoptimized
            priority={i === 0}
            className={classNames(
              'object-cover transition-opacity duration-1000 ease-in-out',
              i === activeIndex ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}

        <div className="absolute right-3 top-3 z-10 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-soft">
          <p className="text-[10px] font-bold leading-tight text-ink">🆕 Nuevo ingreso</p>
          <p className="text-[9px] leading-tight text-muted">+2.400 clientas nos recomiendan</p>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={classNames(
                  'h-1.5 rounded-full shadow-sm transition-all',
                  i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60',
                )}
              />
            ))}
          </div>
        )}

        {/* El texto va centrado en la mitad de la foto, dentro de su
            propio panel oscuro semitransparente — así no depende de qué
            tan clara u oscura sea la foto que suba el admin, y deja la
            cara y las sandalias completamente libres arriba y abajo. */}
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
          <div className="max-w-lg rounded-card bg-ink/55 p-6 text-center shadow-lift backdrop-blur-sm sm:p-10">
            <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              {hero.eyebrow}
            </span>
            <h1
              className={classNames(
                'font-heading font-medium italic leading-[1.05] tracking-tight text-white',
                TITLE_SIZE_CLASSES[hero.titleSize] ?? TITLE_SIZE_CLASSES.md,
              )}
            >
              {hero.heading}
            </h1>
            <p
              className={classNames(
                'mx-auto mt-3 max-w-md text-white/90',
                SUBTEXT_SIZE_CLASSES[hero.subtextSize] ?? SUBTEXT_SIZE_CLASSES.md,
              )}
            >
              {hero.subtext}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={hero.button1Url}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-ink shadow-lift transition-transform hover:scale-105"
              >
                {hero.button1Text}
              </Link>
              <Link
                href={hero.button2Url}
                className="rounded-full border-2 border-white px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-ink"
              >
                {hero.button2Text}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
