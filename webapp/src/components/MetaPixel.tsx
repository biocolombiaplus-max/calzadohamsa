'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Inyecta el código base del Meta Pixel una sola vez y dispara "PageView"
// en cada cambio de página — en Next.js (App Router) navegar entre
// páginas NO recarga el documento, así que hay que avisarle al pixel a
// mano en cada cambio de ruta, o solo contaría la primera página que se
// abre en toda la visita.
export default function MetaPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);
  // Guarda la última ruta que ya se avisó, no un simple "es la primera
  // vez" — en desarrollo, React StrictMode vuelve a ejecutar cada efecto
  // dos veces seguidas para detectar bugs, y una bandera de "primera vez"
  // se consume en esa primera repetición y dispara un PageView de más en
  // la segunda. Comparar contra la ruta ya avisada es correcto sin
  // importar cuántas veces se repita el efecto.
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!PIXEL_ID || initialized.current) return;
    initialized.current = true;

    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function (...args: any[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq?.('init', PIXEL_ID);
    window.fbq?.('track', 'PageView');
    lastTrackedPath.current = pathname;
    // Se ejecuta una sola vez, al montar — guarda la ruta inicial tal como
    // esté en ese momento, no debe volver a correr si "pathname" cambia
    // después (para eso está el segundo efecto).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!PIXEL_ID || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  return null;
}
