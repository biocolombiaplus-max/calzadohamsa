'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/orders';
import type { Order, OrderStatus } from '@/lib/types';
import { formatPrice, whatsappLinkTo } from '@/lib/utils';

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-urgent/10 text-urgent',
  confirmado: 'bg-primary-light/20 text-primary-hover',
  enviado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-border text-muted',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status);
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
  }

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Pedidos</h1>
      <p className="mb-6 text-sm text-muted">Gestiona y da seguimiento a las compras de tus clientas</p>

      <div className="space-y-4">
        {orders === null ? (
          <p className="text-muted">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-card bg-white p-6 text-center text-muted shadow-soft">Todavía no hay pedidos.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-card bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[order.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-muted">Cliente</p>
                  <p className="text-sm text-ink">{order.customer.name}</p>
                  <p className="text-sm text-muted">{order.customer.phone}</p>
                  <p className="text-sm text-muted">
                    {order.customer.address}, {order.customer.city}, {order.customer.department}
                  </p>
                  {order.customer.note && (
                    <p className="mt-1 text-xs italic text-muted">&ldquo;{order.customer.note}&rdquo;</p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-muted">Productos</p>
                  <ul className="space-y-1 text-sm text-ink">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.title} (T.{item.size}, {item.color}) × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="text-sm">
                  <span className="text-muted">Total: </span>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                  <span className="ml-3 text-muted">
                    {order.paymentMethod === 'contra_entrega' ? '💵 Contra entrega' : '🏦 Transferencia'}
                  </span>
                </div>
                <a
                  href={whatsappLinkTo(
                    order.customer.phone,
                    `Hola ${order.customer.name}, te escribimos por tu pedido ${order.orderNumber}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-whatsapp hover:underline"
                >
                  💬 Contactar por WhatsApp
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
