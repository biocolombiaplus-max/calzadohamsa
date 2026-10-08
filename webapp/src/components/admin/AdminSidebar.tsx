'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/auth';
import { useAdminUser } from '@/lib/admin-context';
import { classNames } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: '📊 Panel', exact: true },
  { href: '/admin/visitantes', label: '👀 Visitantes' },
  { href: '/admin/productos', label: '👡 Productos' },
  { href: '/admin/pedidos', label: '📦 Pedidos' },
  { href: '/admin/crm', label: '💬 CRM' },
  { href: '/admin/configuracion', label: '⚙️ Configuración' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAdminUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logoutAdmin();
    router.push('/admin/login');
  }

  const currentLabel = LINKS.find((l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href)))?.label ?? 'Menú';

  return (
    <aside className="w-full shrink-0 border-b border-border bg-white sm:min-h-screen sm:w-56 sm:border-b-0 sm:border-r sm:p-4">
      {/* Barra compacta solo en celular: nombre de la sección actual + botón
          para abrir el menú completo — antes el menú intentaba caber en una
          sola fila horizontal y "Configuración" quedaba empujado fuera de
          la pantalla, sin ninguna forma de llegar a él. */}
      <div className="flex items-center justify-between p-4 sm:hidden">
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-ink">Hamsa Admin</p>
          <p className="truncate text-xs text-muted">{currentLabel}</p>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 pb-4 pt-2 sm:hidden">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={classNames(
                  'rounded-lg px-3 py-2.5 text-sm font-semibold',
                  active ? 'bg-primary text-white' : 'text-ink hover:bg-cream-alt',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="mt-2 px-3 py-1.5 text-left text-sm font-semibold text-muted hover:text-urgent">
            Cerrar sesión
          </button>
          <Link href="/" className="px-3 py-1.5 text-left text-xs text-muted hover:text-primary">
            ← Ver tienda
          </Link>
        </nav>
      )}

      {/* Columna normal, siempre visible, para pantallas más anchas (tablet/computador). */}
      <div className="hidden sm:flex sm:h-full sm:flex-col">
        <div className="mb-6">
          <p className="font-heading text-lg font-bold text-ink">Hamsa Admin</p>
          {user?.email && <p className="truncate text-xs text-muted">{user.email}</p>}
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'rounded-lg px-3 py-2 text-sm font-semibold',
                  active ? 'bg-primary text-white' : 'text-ink hover:bg-cream-alt',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="mt-6 text-left text-sm font-semibold text-muted hover:text-urgent">
          Cerrar sesión
        </button>
        <Link href="/" className="mt-2 text-left text-xs text-muted hover:text-primary">
          ← Ver tienda
        </Link>
      </div>
    </aside>
  );
}
