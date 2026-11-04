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

// La fuente script (Great Vibes) se ve visualmente más chica que una
// serif en el mismo tamaño de letra — por eso estos tamaños van un
// escalón más grande que antes, para que el título nunca se pierda.
const TITLE_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

const SUBTEXT_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-base sm:text-lg',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
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
            cara y las sandalias completamente libres arriba y abajo. Sin
            ninguna caja ni panel detrás — el texto va directo sobre la
            foto, con una sombra marcada para que siempre se lea bien
            (la misma técnica que usan las marcas de moda grandes). */}
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-6 text-center">
          <div className="max-w-sm">
            <span className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] sm:text-xs">
              {hero.eyebrow}
            </span>
            {/* Tipografía script (como "Nueva Colección" de la
                referencia) solo para el título del Hero — sombra fuerte
                de respaldo para que nunca se pierda, sea cual sea la
                foto de fondo. */}
            <h1
              className={classNames(
                "font-['Great_Vibes'] leading-[1.15] text-white [text-shadow:0_3px_18px_rgba(0,0,0,0.75)]",
                TITLE_SIZE_CLASSES[hero.titleSize] ?? TITLE_SIZE_CLASSES.md,
              )}
            >
              {hero.heading}
            </h1>
            <p
              className={classNames(
                'mx-auto mt-3 max-w-xs font-semibold text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]',
                SUBTEXT_SIZE_CLASSES[hero.subtextSize] ?? SUBTEXT_SIZE_CLASSES.md,
              )}
            >
              {hero.subtext}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={hero.button1Url}
                className="group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-bold text-ink shadow-lift transition-transform hover:scale-105 sm:text-base"
              >
                {/* Brillo que cruza el botón cada pocos segundos — el CTA
                    principal del Hero, así que es el único que lo lleva. */}
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-button-sheen bg-gradient-to-r from-transparent via-ink/40 to-transparent" />
                <span className="relative">{hero.button1Text}</span>
              </Link>
              <Link
                href={hero.button2Url}
                className="rounded-full border border-white px-5 py-2.5 text-xs font-bold text-white shadow-soft transition-colors hover:bg-white hover:text-ink sm:text-sm"
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
