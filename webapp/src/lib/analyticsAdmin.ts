'use client';

// Lectura/agregación de la analítica propia (src/lib/analytics.ts) para el
// panel /admin — protegida por las reglas de Firestore (solo admin puede
// leer "analyticsSessions"). Usa onSnapshot para que el embudo se vea
// actualizar en vivo mientras la administradora tiene el panel abierto,
// sin tener que recargar la página.

import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface FunnelSummary {
  totalVisits: number;
  reachedProducto: number;
  reachedCarrito: number;
  reachedCheckout: number;
  reachedCompra: number;
  bySource: { source: string; count: number }[];
}

const EMPTY_SUMMARY: FunnelSummary = {
  totalVisits: 0,
  reachedProducto: 0,
  reachedCarrito: 0,
  reachedCheckout: 0,
  reachedCompra: 0,
  bySource: [],
};

export function subscribeToFunnelSummary(
  sinceDays: number,
  onChange: (summary: FunnelSummary) => void,
): () => void {
  if (!db) {
    onChange(EMPTY_SUMMARY);
    return () => {};
  }

  const cutoff = Timestamp.fromMillis(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const q = query(collection(db, 'analyticsSessions'), where('firstSeenAt', '>=', cutoff));

  return onSnapshot(
    q,
    (snap) => {
      let reachedProducto = 0;
      let reachedCarrito = 0;
      let reachedCheckout = 0;
      let reachedCompra = 0;
      const sourceCounts = new Map<string, number>();

      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.reachedProducto) reachedProducto++;
        if (data.reachedCarrito) reachedCarrito++;
        if (data.reachedCheckout) reachedCheckout++;
        if (data.reachedCompra) reachedCompra++;

        const source = data.utmSource || data.utmCampaign || 'Directo / orgánico';
        sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
      });

      const bySource = Array.from(sourceCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      onChange({ totalVisits: snap.size, reachedProducto, reachedCarrito, reachedCheckout, reachedCompra, bySource });
    },
    () => onChange(EMPTY_SUMMARY),
  );
}
