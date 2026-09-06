'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function FloatingBadge({ href = '/oferta-2x1' }: { href?: string }) {
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const hasStickyBuyBar = pathname?.startsWith('/producto/');
  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 z-30 animate-popIn ${hasStickyBuyBar ? 'hidden lg:block' : ''}`}
    >
      <div className="relative animate-float">
        <Link
          href={href}
          className="relative flex w-[4.75rem] animate-glow-urgent flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A4D] via-urgent to-[#9C2B2B] py-3.5 shadow-lift ring-1 ring-white/40 transition-transform hover:scale-105"
        >
          <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <span className="relative rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
            Oferta
          </span>
          <span className="relative text-2xl font-extrabold leading-none text-white drop-shadow-sm">2×1</span>
        </Link>

        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F4C542] text-[10px] shadow-soft">
          🔥
        </span>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
