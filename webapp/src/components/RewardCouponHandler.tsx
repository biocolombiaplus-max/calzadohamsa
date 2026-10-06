'use client';

import { useEffect, useState } from 'react';
import { applyRewardCoupon } from '@/lib/reviews';

// Si la clienta entra con "?cupon=CODIGO" en la URL (el botón "Comprar con
// mi bono" de la página de reseña), se valida y se activa solo — llega al
// checkout ya aplicado, sin que tenga que escribir nada.
export default function RewardCouponHandler() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('cupon');
    if (!code) return;

    applyRewardCoupon(code).then((result) => {
      if (result.ok && result.percent) {
        setToast(`🎉 Tu bono del ${result.percent}% ya quedó activado para esta compra`);
        setTimeout(() => setToast(null), 6000);
      }
      params.delete('cupon');
      const rest = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
    });
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <div className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-bold text-white shadow-soft">{toast}</div>
    </div>
  );
}
