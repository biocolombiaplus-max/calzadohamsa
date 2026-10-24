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
    <div className={`fixed bottom-5 right-5 z-30 ${hasStickyBuyBar ? 'hidden lg:block' : ''}`}>
      <div className="relative">
        <Link
          href={href}
          className="relative flex w-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-urgent bg-ink py-4 shadow-lift transition-transform hover:scale-105 animate-glow-urgent"
        >
          <span className="rounded-full bg-urgent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Oferta
          </span>
          <span className="text-2xl font-extrabold leading-none text-cream">2×1</span>
        </Link>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-[10px] text-ink shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
