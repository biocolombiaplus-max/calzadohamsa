'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeToNewOrders } from '@/lib/orders';
import { playCashRegisterSound, unlockAudio } from '@/lib/cashRegisterSound';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

const STORAGE_KEY = 'hamsa-admin-sound-enabled';

// Activo en todo el panel admin (no solo en Pedidos): suena la campanita y
// muestra un aviso apenas entra un pedido nuevo, sin importar en qué
// sección esté la administradora en ese momento.
export default function OrderAlertListener() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [toastOrder, setToastOrder] = useState<Order | null>(null);
  const soundEnabledRef = useRef(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      unlockAudio().then((ok) => setSoundEnabled(ok));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToNewOrders((order) => {
      setToastOrder(order);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastOrder(null), 10000);
      if (soundEnabledRef.current) playCashRegisterSound();
    });
    return () => {
      unsubscribe();
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  async function handleToggleSound() {
    if (soundEnabled) {
      setSoundEnabled(false);
      localStorage.setItem(STORAGE_KEY, '0');
      return;
    }
    const ok = await unlockAudio();
    if (ok) {
      setSoundEnabled(true);
      localStorage.setItem(STORAGE_KEY, '1');
      playCashRegisterSound();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleToggleSound}
        title={soundEnabled ? 'Sonido de pedidos activado — clic para probarlo' : 'Activar sonido de pedidos nuevos'}
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-lift transition-transform hover:scale-105 ${
          soundEnabled ? 'bg-primary text-white' : 'animate-pulseSoft bg-urgent text-white'
        }`}
      >
        {soundEnabled ? '🔔 Sonido activado' : '🔕 Activar sonido de pedidos'}
      </button>

      {toastOrder && (
        <div className="fixed bottom-20 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] animate-popIn rounded-card border-2 border-primary bg-white p-4 shadow-lift relative">
          <p className="text-sm font-bold text-ink">🛎️ ¡Nuevo pedido recibido!</p>
          <p className="mt-1 text-sm text-ink">
            {toastOrder.orderNumber} · <span className="font-bold text-primary">{formatPrice(toastOrder.total)}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">{toastOrder.customer.name} · {toastOrder.customer.city}</p>
          <button
            type="button"
            onClick={() => setToastOrder(null)}
            className="absolute right-2 top-2 text-xs text-muted hover:text-ink"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
