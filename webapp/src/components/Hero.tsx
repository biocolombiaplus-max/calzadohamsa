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

        {/* Degradado oscuro abajo para que el texto blanco siempre se lea
            bien, sea cual sea la foto que suba el admin. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

        {/* Cinta lateral con la oferta — mismo texto configurable que ya
            existía (hero.badge1), ahora como una etiqueta llamativa en el
            borde de la foto en vez de perderse entre otras tres. */}
        <div className="absolute left-0 top-[38%] z-10 -translate-y-1/2">
          <div className="bg-urgent px-3 py-2.5 text-xs font-bold uppercase leading-tight tracking-wide text-white shadow-lift sm:px-4 sm:text-sm">
            {hero.badge1}
          </div>
        </div>

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

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 lg:p-14">
          <span className="mb-3 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {hero.eyebrow}
          </span>
          <h1
            className={classNames(
              'font-heading font-medium italic leading-[1.05] tracking-tight text-white drop-shadow-sm',
              TITLE_SIZE_CLASSES[hero.titleSize] ?? TITLE_SIZE_CLASSES.md,
            )}
          >
            {hero.heading}
          </h1>
          <p
            className={classNames(
              'mt-3 max-w-md text-white/90',
              SUBTEXT_SIZE_CLASSES[hero.subtextSize] ?? SUBTEXT_SIZE_CLASSES.md,
            )}
          >
            {hero.subtext}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
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
    </section>
  );
}
