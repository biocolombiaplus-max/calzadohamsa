'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSiteSettings } from '@/lib/settings-context';
import { whatsappLinkTo } from '@/lib/utils';

export default function Hero() {
  const { hero, storeName, whatsappCountryCode, whatsappNumber } = useSiteSettings();

  return (
    <section className="bg-cream">
      <div className="container-page grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-block rounded-full bg-primary-light/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-hover">
            {hero.eyebrow}
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {hero.heading}
          </h1>
          <p className="mt-4 max-w-md text-base text-muted sm:text-lg">{hero.subtext}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[hero.badge1, hero.badge2, hero.badge3].map((badge, i) => (
              <span
                key={i}
                className="flex animate-glow items-center justify-center rounded-full bg-white px-2 py-2.5 text-center text-[11px] font-bold leading-tight text-ink shadow-soft ring-1 ring-primary/10 transition-transform hover:-translate-y-0.5 sm:px-3 sm:text-xs"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link href={hero.button1Url} className="btn-primary">
              {hero.button1Text}
            </Link>
            <Link href={hero.button2Url} className="btn-secondary">
              {hero.button2Text}
            </Link>
          </div>

          <a
            href={whatsappLinkTo(whatsappNumber, `Hola, quiero ver el catálogo de ${storeName}`, whatsappCountryCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-whatsapp"
          >
            💬 O escríbenos directo por WhatsApp →
          </a>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-cream-alt shadow-soft">
          <Image src={hero.image || '/hero-placeholder.svg'} alt={storeName} fill priority className="object-cover" />
          <div className="absolute bottom-4 left-4 rounded-card bg-white/95 px-4 py-2.5 shadow-soft">
            <p className="text-xs font-bold text-ink">🆕 Nuevo ingreso</p>
            <p className="text-[11px] text-muted">+2.400 clientas nos recomiendan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
