'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

// next/image con respaldo: si una foto no carga (enlace roto, se borró de
// Cloudinary, se perdió la conexión...), en vez de mostrar el ícono feo de
// "imagen rota" del navegador, se muestra un respaldo — para que la tienda
// nunca se vea quebrada, pase lo que pase con la foto original. Por
// defecto un ícono de sandalia, o lo que se le pase en "fallback" (ej. las
// iniciales de una clienta en un testimonio).
export default function SafeImage({ alt, className, fallback, ...props }: ImageProps & { fallback?: React.ReactNode }) {
  const [failed, setFailed] = useState(false);

  if (failed || !props.src) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-cream-alt text-2xl">
        {fallback ?? '👡'}
      </span>
    );
  }

  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
