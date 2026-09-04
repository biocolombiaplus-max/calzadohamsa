'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { storeName, logoUrl } = useSiteSettings();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.open);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {logoUrl ? (
            <span className="relative block h-9 w-32 sm:h-11 sm:w-40">
              <Image src={logoUrl} alt={storeName} fill className="object-contain object-left" />
            </span>
          ) : (
            storeName
          )}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink md:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/catalogo" className="transition-colors hover:text-primary">
            Catálogo
          </Link>
          <Link href="/catalogo?oferta=2x1" className="text-primary transition-colors hover:text-primary-hover">
            🔥 Oferta 2×1
          </Link>
        </nav>

        <button
          onClick={openCart}
          aria-label="Abrir carrito"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition-transform hover:scale-105"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
            <path d="M6 6 5 2H2" strokeLinecap="round" />
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
          </svg>
          {mounted && totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-urgent text-[11px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
