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
    <div className={`fixed bottom-5 right-5 z-30 animate-float ${hasStickyBuyBar ? 'hidden lg:block' : ''}`}>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-ping rounded-2xl bg-urgent/60"
        />
        <Link
          href={href}
          className="relative flex w-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-urgent py-4 shadow-lift ring-2 ring-white transition-transform hover:scale-110"
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">Oferta</span>
          <span className="text-2xl font-extrabold leading-none text-white">2×1</span>
        </Link>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-[10px] text-ink shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
