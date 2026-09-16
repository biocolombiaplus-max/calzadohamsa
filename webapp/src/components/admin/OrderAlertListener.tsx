'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeToNewOrders } from '@/lib/orders';
import { playCashRegisterSound, unlockAudio } from '@/lib/cashRegisterSound';
import { getActivePushSubscription, isPushSupported, subscribeToPushNotifications } from '@/lib/push';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

const SOUND_STORAGE_KEY = 'hamsa-admin-sound-enabled';

// Activo en todo el panel admin (no solo en Pedidos): apenas entra un
// pedido nuevo, suena la campanita (si el navegador sigue abierto) y llega
// una notificación push al celular (funcione o no la tienda abierta —
// igual que la app de Shopify). La suscripción push la recuerda el propio
// navegador, así que una vez activada queda para siempre, sin tener que
// repetir el paso cada vez que la administradora vuelve a entrar.
export default function OrderAlertListener() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushChecked, setPushChecked] = useState(false);
  const [activating, setActivating] = useState(false);
  const [toastOrder, setToastOrder] = useState<Order | null>(null);
  const soundEnabledRef = useRef(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (localStorage.getItem(SOUND_STORAGE_KEY) === '1') {
      unlockAudio().then((ok) => setSoundEnabled(ok));
    }
    getActivePushSubscription().then((sub) => {
      setPushEnabled(!!sub);
      setPushChecked(true);
    });
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

  async function handleActivate() {
    setActivating(true);
    try {
      const audioOk = await unlockAudio();
      if (audioOk) {
        setSoundEnabled(true);
        localStorage.setItem(SOUND_STORAGE_KEY, '1');
        playCashRegisterSound();
      }
      if (isPushSupported()) {
        const result = await subscribeToPushNotifications();
        setPushEnabled(result === 'granted');
      }
    } finally {
      setActivating(false);
    }
  }

  const fullyActive = soundEnabled && (pushEnabled || !isPushSupported());
  // Antes de saber si ya hay una suscripción push guardada, no mostramos
  // nada para no parpadear el botón de "activar" un instante de más.
  if (!pushChecked) return null;

  return (
    <>
      {!fullyActive && (
        <button
          type="button"
          onClick={handleActivate}
          disabled={activating}
          title="Activa el sonido y las notificaciones push de pedidos nuevos (solo se hace una vez)"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-urgent px-4 py-2.5 text-sm font-bold text-white shadow-lift transition-transform hover:scale-105 disabled:opacity-70 animate-pulseSoft"
        >
          {activating ? 'Activando...' : '🔔 Activar notificaciones de pedidos'}
        </button>
      )}
      {fullyActive && (
        <div
          title="Sonido y notificaciones push activos en este dispositivo"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lift"
        >
          🔔 Notificaciones activas
        </div>
      )}

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
