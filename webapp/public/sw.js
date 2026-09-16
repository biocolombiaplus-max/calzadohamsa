// Service worker de notificaciones push — recibe el aviso de pedido nuevo
// del servidor y lo muestra como notificación del sistema, funcione o no
// la tienda abierta en ese momento (igual que la app de Shopify).

self.addEventListener('push', (event) => {
  let data = { title: '🎉 Nuevo pedido', body: 'Entra a ver el detalle.', url: '/admin/pedidos' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // si el payload no es JSON, se usan los valores por defecto
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192',
      badge: '/icon-192',
      data: { url: data.url },
      vibrate: [400, 150, 400, 150, 400, 150, 600],
      requireInteraction: true,
      silent: false,
      // Sin esta combinación, si llegan dos pedidos seguidos, la segunda
      // notificación con la misma "tag" reemplazaba a la primera SIN volver
      // a sonar ni vibrar (comportamiento por defecto del navegador) — con
      // "renotify" cada pedido nuevo vuelve a alertar de verdad.
      tag: `pedido-${Date.now()}`,
      renotify: true,
      actions: [{ action: 'view', title: '👀 Ver pedido' }],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/pedidos';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    }),
  );
});
