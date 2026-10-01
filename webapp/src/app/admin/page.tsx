'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/products';
import { getAllOrders } from '@/lib/orders';
import { formatPrice, classNames } from '@/lib/utils';
import { subscribeToFunnelSummary, type FunnelSummary } from '@/lib/analyticsAdmin';
import AnalyticsFunnel from '@/components/admin/AnalyticsFunnel';

const RANGE_OPTIONS = [
  { label: 'Hoy', days: 1 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    products: number;
    activeProducts: number;
    orders: number;
    pendingOrders: number;
    revenue: number;
  } | null>(null);
  const [rangeDays, setRangeDays] = useState(7);
  const [funnel, setFunnel] = useState<FunnelSummary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [products, orders] = await Promise.all([getAllProducts(), getAllOrders()]);
        setStats({
          products: products.length,
          activeProducts: products.filter((p) => p.active).length,
          orders: orders.length,
          pendingOrders: orders.filter((o) => o.status === 'pendiente').length,
          revenue: orders.reduce((sum, o) => sum + o.total, 0),
        });
      } catch {
        setStats({ products: 0, activeProducts: 0, orders: 0, pendingOrders: 0, revenue: 0 });
      }
    })();
  }, []);

  useEffect(() => subscribeToFunnelSummary(rangeDays, setFunnel), [rangeDays]);

  const cards = [
    { label: 'Productos activos', value: stats ? `${stats.activeProducts}/${stats.products}` : '—' },
    { label: 'Pedidos totales', value: stats ? stats.orders : '—' },
    { label: 'Pedidos pendientes', value: stats ? stats.pendingOrders : '—' },
    { label: 'Ventas totales', value: stats ? formatPrice(stats.revenue) : '—' },
  ];

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Panel de control</h1>
      <p className="mb-8 text-sm text-muted">Resumen general de tu tienda</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Agregar producto
        </Link>
        <Link href="/admin/pedidos" className="btn-secondary">
          Ver pedidos
        </Link>
      </div>

      <div className="mt-8 rounded-card bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">Embudo de ventas</h2>
            <p className="text-xs text-muted">
              Quiénes entran a tu tienda y en qué paso se quedan — se actualiza solo, en vivo.
            </p>
          </div>
          <div className="flex gap-1.5 rounded-full bg-cream-alt p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setRangeDays(opt.days)}
                className={classNames(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  rangeDays === opt.days ? 'bg-primary text-white' : 'text-muted hover:text-ink',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {funnel === null ? (
          <p className="py-6 text-center text-sm text-muted">Cargando...</p>
        ) : funnel.totalVisits === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Todavía no hay visitas registradas en este período.
          </p>
        ) : (
          <AnalyticsFunnel summary={funnel} />
        )}
      </div>
    </div>
  );
}
