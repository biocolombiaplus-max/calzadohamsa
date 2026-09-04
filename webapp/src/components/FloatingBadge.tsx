'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FloatingBadge({ href = '/catalogo?oferta=2x1' }: { href?: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-30 animate-popIn">
      <div className="relative flex h-[4.5rem] w-[4.5rem] animate-float items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-urgent/50" />
        <span className="absolute inset-0 rounded-full bg-urgent/25 blur-md" />
        <Link
          href={href}
          className="relative flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full bg-gradient-to-br from-urgent to-primary text-center font-extrabold text-white shadow-lift ring-2 ring-white/50 transition-transform hover:scale-110"
        >
          <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <span className="relative text-[8px] uppercase tracking-wider opacity-90">Oferta</span>
          <span className="relative text-lg leading-none">2×1</span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
