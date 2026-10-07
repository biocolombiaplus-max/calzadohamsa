'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

// next/image con respaldo: si una foto no carga (enlace roto, se borró de
// Cloudinary, se perdió la conexión...), en vez de mostrar el ícono feo de
// "imagen rota" del navegador, se muestra un respaldo — para que la tienda
// nunca se vea quebrada, pase lo que pase con la foto original. Por
// defecto un ícono de sandalia, o lo que se le pase en "fallback" (ej. las
// iniciales de una clienta en un testimonio).
//
// Las fotos de Cloudinary ya llegan redimensionadas y optimizadas por la
// propia URL (c_fill, q_auto, f_auto...) — si Next.js las vuelve a pasar
// por SU PROPIO optimizador (lo hace por defecto), la foto se pide dos
// veces, y la primera vez que se pide un tamaño nuevo (ej. una foto grande
// que nadie había visto así) esa segunda vuelta a veces se cae por tiempo
// de espera, aunque la misma foto en un tamaño ya visto (una miniatura)
// cargue perfecto — exactamente el patrón de "la miniatura carga pero la
// foto grande no". Por eso se le pide a Next que NO la vuelva a optimizar
// cuando ya es una URL de Cloudinary: se sirve tal cual, una sola vez.
function isCloudinaryUrl(src: ImageProps['src']): boolean {
  return typeof src === 'string' && src.includes('res.cloudinary.com');
}

export default function SafeImage({ alt, className, fallback, ...props }: ImageProps & { fallback?: React.ReactNode }) {
  const [failed, setFailed] = useState(false);

  if (failed || !props.src) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-cream-alt text-2xl">
        {fallback ?? '👡'}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      unoptimized={isCloudinaryUrl(props.src)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
