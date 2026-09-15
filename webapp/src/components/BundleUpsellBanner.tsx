'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

// Empuje al 2x1 al estilo Shein/Zara: barra de progreso + botón grande,
// visible solo cuando la clienta tiene un número impar de unidades (le
// falta exactamente 1 para completar la pareja con descuento).
export default function BundleUpsellBanner({
  totalUnits,
  bundlePrice,
  onNavigate,
}: {
  totalUnits: number;
  bundlePrice: number;
  onNavigate?: () => void;
}) {
  if (totalUnits === 0 || totalUnits % 2 === 0) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-card border-2 border-urgent/30 bg-gradient-to-br from-urgent/10 via-primary-light/10 to-primary/10 p-4">
      <p className="mb-2 text-sm font-extrabold leading-snug text-ink">
        🎁 ¡Estás a <span className="text-urgent">1 par</span> de tu 2×1 con envío GRATIS!
      </p>
      <div className="mb-2.5 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-urgent to-primary" />
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink/70">
        Lleva <strong>2 pares</strong> por{' '}
        <strong className="text-primary">{formatPrice(bundlePrice)}</strong> en vez de pagarlos por separado — y el
        envío corre por nuestra cuenta.
      </p>
      <Link
        href="/catalogo"
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        ✨ Elegir mi segundo par →
      </Link>
    </div>
  );
}
