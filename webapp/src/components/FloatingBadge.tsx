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
          className="relative flex w-[4.75rem] flex-col items-center justify-center gap-1 border border-ink bg-ink py-3.5 shadow-soft transition-transform hover:scale-105"
        >
          <span className="text-[8px] font-bold uppercase tracking-wider text-cream/80">Oferta</span>
          <span className="text-xl font-bold leading-none text-cream">2×1</span>
        </Link>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar"
          className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-[10px] text-ink shadow-soft"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
