'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function FloatingBadge({ href = '/catalogo?oferta=2x1' }: { href?: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-30 flex items-center">
      <Link
        href={href}
        className="flex h-16 w-16 animate-pulseSoft items-center justify-center rounded-full bg-urgent text-center text-[11px] font-extrabold leading-tight text-white shadow-lift transition-transform hover:scale-110"
      >
        🔥
        <br />
        2×1
      </Link>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Cerrar"
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white"
      >
        ✕
      </button>
    </div>
  );
}
