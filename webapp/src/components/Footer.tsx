import Link from 'next/link';
import { whatsappLink } from '@/lib/utils';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-heading text-xl font-bold">{STORE_NAME}</h3>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            Sandalias y zapatos femeninos elegantes, con envíos a toda Colombia. Comodidad y estilo en cada paso.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1">🚚 Envío gratis</span>
            <span className="rounded-full bg-white/10 px-3 py-1">💵 Contra entrega</span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-light">Navegación</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li><Link href="/" className="hover:text-white">Inicio</Link></li>
            <li><Link href="/catalogo" className="hover:text-white">Catálogo</Link></li>
            <li><Link href="/carrito" className="hover:text-white">Carrito</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-light">Información</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>📦 Envíos a toda Colombia</li>
            <li>💬 Atención por WhatsApp</li>
            <li>🔄 Cambio de talla gratis</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary-light">Contacto</h4>
          <p className="mb-4 text-sm text-cream/80">¿Dudas con tu talla o tu pedido? Escríbenos, respondemos rápido.</p>
          <a
            href={whatsappLink(`Hola, quiero información sobre ${STORE_NAME}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            💬 Hablar por WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
