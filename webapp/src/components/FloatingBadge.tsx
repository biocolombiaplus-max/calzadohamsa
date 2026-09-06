'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FloatingBadge({ href = '/catalogo?oferta=2x1' }: { href?: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-30 animate-popIn">
      <div className="relative flex h-20 w-20 animate-float items-center justify-center">
        {/* Halo tipo destello girando detrás, efecto "sticker" */}
        <span
          className="absolute -inset-3 animate-spin-slow rounded-full opacity-70"
          style={{
            background:
              'repeating-conic-gradient(#F4C542 0deg 15deg, transparent 15deg 30deg)',
          }}
        />
        <span className="absolute inset-0 animate-ping rounded-full bg-urgent/50" />
        <span className="absolute inset-0 rounded-full bg-urgent/25 blur-md" />

        <Link
          href={href}
          className="relative flex h-full w-full animate-attention flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full bg-gradient-to-br from-urgent via-urgent to-primary text-center font-extrabold text-white shadow-lift ring-[3px] ring-[#F4C542] transition-transform hover:scale-110"
        >
          <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <span className="relative text-[8px] uppercase tracking-wider opacity-90">Oferta</span>
          <span className="relative text-xl leading-none drop-shadow-sm">2×1</span>
          <span className="relative text-[7px] font-bold uppercase tracking-wide text-[#F4C542]">
            Hoy
          </span>
        </Link>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
