'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/lib/settings-context';
import { whatsappLinkTo } from '@/lib/utils';

const SOCIALS: { key: 'instagram' | 'facebook' | 'tiktok'; label: string; icon: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'facebook', label: 'Facebook', icon: '📘' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function Footer() {
  const { storeName, whatsappCountryCode, whatsappNumber, footer } = useSiteSettings();
  const socialLinks = SOCIALS.filter((s) => footer[s.key]);

  return (
    <footer className="bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-heading text-xl font-bold">{storeName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">{footer.brandText}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1">🚚 Envío gratis</span>
            <span className="rounded-full bg-white/10 px-3 py-1">💵 Contra entrega</span>
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-3 text-xl">
              {socialLinks.map((s) => (
                <a
                  key={s.key}
                  href={footer[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
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
          <p className="mb-4 text-sm text-cream/80">{footer.contactText}</p>
          <a
            href={whatsappLinkTo(whatsappNumber, `Hola, quiero información sobre ${storeName}`, whatsappCountryCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            💬 Hablar por WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-cream/50">
        <p>
          {footer.copyrightText || `© ${new Date().getFullYear()} ${storeName}. Todos los derechos reservados.`}
        </p>
        <Link href="/admin/login" className="mt-2 inline-block text-cream/30 transition-colors hover:text-cream/70">
          Iniciar sesión
        </Link>
      </div>
    </footer>
  );
}
