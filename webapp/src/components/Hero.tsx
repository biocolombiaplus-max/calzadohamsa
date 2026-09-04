import Link from 'next/link';
import Image from 'next/image';
import { whatsappLink } from '@/lib/utils';

export default function Hero() {
  return (
    <section className="bg-cream">
      <div className="container-page grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-block rounded-full bg-primary-light/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-hover">
            ✨ Colección 2025 — Nuevos ingresos
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Sandalias que te hacen brillar
          </h1>
          <p className="mt-4 max-w-md text-base text-muted sm:text-lg">
            Diseños exclusivos para la mujer colombiana. Envío gratis · Pago al recibir · Cambio de talla gratis.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-ink">
            <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">🚚 Envío gratis</span>
            <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">💵 Contra entrega</span>
            <span className="rounded-full bg-white px-3 py-1.5 shadow-soft">⭐ +2.400 felices</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/catalogo" className="btn-primary">
              🛍️ Ver colección
            </Link>
            <Link href="/catalogo?oferta=2x1" className="btn-secondary">
              🔥 Oferta 2×1
            </Link>
          </div>

          <a
            href={whatsappLink('Hola, quiero ver el catálogo de sandalias')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-whatsapp"
          >
            💬 O escríbenos directo por WhatsApp →
          </a>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-cream-alt shadow-soft">
          <Image
            src="/hero-placeholder.svg"
            alt="Sandalias Hamsa Shoes"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-card bg-white/95 px-4 py-2.5 shadow-soft">
            <p className="text-xs font-bold text-ink">🆕 Nuevo ingreso</p>
            <p className="text-[11px] text-muted">+2.400 clientas nos recomiendan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
