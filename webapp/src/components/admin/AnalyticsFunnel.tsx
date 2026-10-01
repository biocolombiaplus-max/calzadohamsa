'use client';

import type { FunnelSummary } from '@/lib/analyticsAdmin';

const STEP_LABELS = ['Visitas', 'Vio un producto', 'Agregó al carrito', 'Inició el pago', 'Compró'];

export default function AnalyticsFunnel({ summary }: { summary: FunnelSummary }) {
  const counts = [
    summary.totalVisits,
    summary.reachedProducto,
    summary.reachedCarrito,
    summary.reachedCheckout,
    summary.reachedCompra,
  ];
  const max = counts[0] || 1;

  return (
    <div>
      <div className="space-y-3">
        {STEP_LABELS.map((label, i) => {
          const count = counts[i];
          const widthPct = count > 0 ? Math.max((count / max) * 100, 3) : 0;
          const pctOfTotal = max > 0 ? Math.round((count / max) * 100) : 0;
          const prevCount = i > 0 ? counts[i - 1] : null;
          const dropPct = prevCount && prevCount > 0 && count < prevCount ? Math.round((1 - count / prevCount) * 100) : null;

          return (
            <div key={label}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                <span className="font-semibold text-ink">{label}</span>
                <span className="shrink-0 text-muted">
                  {count.toLocaleString('es-CO')} · {pctOfTotal}%
                  {dropPct !== null && <span className="ml-1.5 font-semibold text-urgent">−{dropPct}%</span>}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-full bg-cream-alt">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {summary.bySource.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">De dónde vienen</p>
          <ul className="space-y-1.5">
            {summary.bySource.map((s) => (
              <li key={s.source} className="flex items-center justify-between text-sm">
                <span className="truncate text-ink">{s.source}</span>
                <span className="shrink-0 font-semibold text-muted">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
