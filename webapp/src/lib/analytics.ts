'use client';

// Analítica propia del sitio (independiente del Meta Pixel) — guarda UN
// documento por sesión de navegador en Firestore y le va marcando hasta
// qué paso del embudo llegó esa visita, para poder ver en /admin cuántas
// personas entran y en qué parte se quedan (ver producto → carrito →
// pago → compra), como el reporte de embudo de Shopify.

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SESSION_ID_KEY = 'hamsa_analytics_sid';
const VISIT_TRACKED_KEY = 'hamsa_analytics_visited';
const UTM_KEY = 'hamsa_analytics_utm';

export type FunnelStep = 'producto' | 'carrito' | 'checkout' | 'compra';

const STEP_FIELD: Record<FunnelStep, string> = {
  producto: 'reachedProducto',
  carrito: 'reachedCarrito',
  checkout: 'reachedCheckout',
  compra: 'reachedCompra',
};

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// El origen (campaña de Meta Ads, orgánico, etc.) se captura una sola vez
// al entrar y se mantiene toda la sesión, aunque la visitante navegue a
// páginas sin esos parámetros en la URL.
function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  const stored = sessionStorage.getItem(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // sigue abajo y vuelve a leerlos de la URL
    }
  }
  const params = new URLSearchParams(window.location.search);
  const utm: { utmSource?: string; utmMedium?: string; utmCampaign?: string } = {};
  if (params.get('utm_source')) utm.utmSource = params.get('utm_source')!;
  if (params.get('utm_medium')) utm.utmMedium = params.get('utm_medium')!;
  if (params.get('utm_campaign')) utm.utmCampaign = params.get('utm_campaign')!;
  sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  return utm;
}

export async function trackVisit(): Promise<void> {
  if (!db || typeof window === 'undefined') return;
  const id = getSessionId();

  if (sessionStorage.getItem(VISIT_TRACKED_KEY)) {
    setDoc(doc(db, 'analyticsSessions', id), { lastSeenAt: serverTimestamp() }, { merge: true }).catch(() => {});
    return;
  }
  sessionStorage.setItem(VISIT_TRACKED_KEY, '1');

  const utm = getUtmParams();
  try {
    await setDoc(
      doc(db, 'analyticsSessions', id),
      {
        firstSeenAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        reachedProducto: false,
        reachedCarrito: false,
        reachedCheckout: false,
        reachedCompra: false,
        ...utm,
      },
      { merge: true },
    );
  } catch {
    // La analítica nunca debe romper la navegación de la clienta.
  }
}

export async function trackFunnelStep(step: FunnelStep): Promise<void> {
  if (!db || typeof window === 'undefined') return;
  await trackVisit();
  const id = getSessionId();
  try {
    await setDoc(
      doc(db, 'analyticsSessions', id),
      { [STEP_FIELD[step]]: true, lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  } catch {
    // Igual que arriba: si falla, no debe afectar la compra real.
  }
}
