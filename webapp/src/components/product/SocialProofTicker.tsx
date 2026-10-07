'use client';

import { useEffect, useState } from 'react';
import { subscribeToRecentSales } from '@/lib/recentSales';
import type { RecentSale } from '@/lib/types';

function timeAgo(ms: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

// Aviso de prueba social — SIEMPRE con ventas reales de la tienda (nunca
// nombres ni tiempos inventados): se alimenta de /lib/recentSales, que se
// llena solo cada vez que se confirma un pedido de verdad. Si la tienda
// todavía no tiene ventas, simplemente no se muestra nada — mejor no
// mostrar nada que mostrar algo falso.
export default function SocialProofTicker({ productTitle: _productTitle }: { productTitle: string }) {
  const [sales, setSales] = useState<RecentSale[] | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeToRecentSales(setSales), []);

  useEffect(() => {
    if (!sales || sales.length === 0) return;
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const show = () => {
      setVisible(true);
      timeout = setTimeout(() => setVisible(false), 5000);
    };

    const first = setTimeout(show, 2000);
    interval = setInterval(() => {
      setIndex((i) => (i + 1) % sales.length);
      show();
    }, 14000);

    return () => {
      clearTimeout(first);
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [sales]);

  if (!sales || sales.length === 0) return null;
  const entry = sales[index % sales.length];

  return (
    <div
      className={`flex items-center gap-3 rounded-card border border-border bg-white px-4 py-3 shadow-soft transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <span className="text-xl">🛍️</span>
      <p className="text-xs text-ink sm:text-sm">
        <strong>{entry.firstName}</strong>
        {entry.city && <> de {entry.city}</>} compró <strong>{entry.productTitle}</strong> hace {timeAgo(entry.createdAt)}
      </p>
    </div>
  );
}
