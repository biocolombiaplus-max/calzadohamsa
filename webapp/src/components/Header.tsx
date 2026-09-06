'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { storeName, logoUrl, logoHeight, collectionsMenu } = useSiteSettings();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.open);
  const collectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const hasCollections = collectionsMenu.length > 0;
  const logoBoxWidth = Math.round(logoHeight * 3.1);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="container-page grid h-20 grid-cols-[1fr_auto_1fr] items-center sm:h-24">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
            {hasCollections && (
              <div ref={collectionsRef} className="relative">
                <button
                  onClick={() => setCollectionsOpen((v) => !v)}
                  className="flex items-center gap-1 transition-colors hover:text-primary"
                >
                  Colecciones
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {collectionsOpen && (
                  <div className="absolute left-0 top-full z-10 mt-3 w-48 overflow-hidden rounded-card bg-white py-2 shadow-lift">
                    {collectionsMenu.map((c) => (
                      <Link
                        key={c.value}
                        href={`/catalogo?collection=${encodeURIComponent(c.value)}`}
                        onClick={() => setCollectionsOpen(false)}
                        className="block px-4 py-2 text-sm text-ink hover:bg-cream-alt hover:text-primary"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Link href="/oferta-2x1" className="text-primary transition-colors hover:text-primary-hover">
              🔥 Oferta 2×1
            </Link>
          </nav>
        </div>

        <Link href="/" className="flex items-center justify-center">
          {logoUrl ? (
            <span className="relative block" style={{ height: logoHeight, width: logoBoxWidth }}>
              <Image src={logoUrl} alt={storeName} fill priority className="object-contain" />
            </span>
          ) : (
            <span
              className="whitespace-nowrap font-heading font-bold tracking-tight text-ink"
              style={{ fontSize: Math.round(logoHeight * 0.4) }}
            >
              {storeName}
            </span>
          )}
        </Link>

        <div className="flex justify-end">
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
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-cream px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-ink">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {hasCollections && (
              <>
                <p className="mt-2 px-3 text-xs font-bold uppercase tracking-wide text-muted">Colecciones</p>
                {collectionsMenu.map((c) => (
                  <Link
                    key={c.value}
                    href={`/catalogo?collection=${encodeURIComponent(c.value)}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white hover:text-primary"
                  >
                    {c.label}
                  </Link>
                ))}
              </>
            )}
            <Link
              href="/oferta-2x1"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg px-3 py-2.5 text-primary transition-colors hover:bg-white"
            >
              🔥 Oferta 2×1
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
