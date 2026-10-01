'use client';

import { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';

// Registra la visita (una por sesión de navegador) para el panel de
// analítica propio en /admin — independiente del Meta Pixel.
export default function AnalyticsTracker() {
  useEffect(() => {
    trackVisit();
  }, []);

  return null;
}
