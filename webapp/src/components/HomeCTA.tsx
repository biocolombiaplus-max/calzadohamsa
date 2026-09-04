import Link from 'next/link';
import { whatsappLink } from '@/lib/utils';

export default function HomeCTA() {
  return (
    <section className="bg-ink py-16 text-center text-cream">
      <div className="container-page">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-light">
          ¿Lista para lucir increíble?
        </p>
        <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold sm:text-4xl">
          Tu sandalia perfecta te está esperando
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-cream/70">
          Más de 2.400 mujeres colombianas ya las tienen. Paga al recibir, envío gratis, cambio de talla sin costo.
        </p>

        <div className="mx-auto mt-5 flex flex-wrap justify-center gap-3 text-xs font-semibold">
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ Envío gratis</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ Pago contra entrega</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">✓ Cambio de talla gratis</span>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link href="/catalogo" className="btn-primary">
            🛍️ Comprar ahora — Envío gratis
          </Link>
          <a
            href={whatsappLink('Hola, quiero comprar en Hamsa Shoes')}
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
