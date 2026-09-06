'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/settings-context';
import { whatsappLinkTo } from '@/lib/utils';

export default function HomeCTA() {
  const { cta, storeName, whatsappCountryCode, whatsappNumber } = useSiteSettings();

  return (
    <section className="bg-ink py-16 text-center text-cream">
      <div className="container-page">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-light">{cta.eyebrow}</p>
        <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold sm:text-4xl">{cta.heading}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-cream/70">{cta.text}</p>

        <div className="mx-auto mt-5 flex flex-wrap justify-center gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ 2×1 con envío gratis</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ Pago contra entrega</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ Cambio de talla gratis</span>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link href={cta.buttonUrl} className="btn-primary">
            {cta.buttonText}
          </Link>
          <a
            href={whatsappLinkTo(whatsappNumber, `Hola, quiero comprar en ${storeName}`, whatsappCountryCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Comprar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
