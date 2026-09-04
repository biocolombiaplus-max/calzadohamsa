'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getOrderById } from '@/lib/orders';
import { formatPrice, whatsappLinkTo } from '@/lib/utils';
import { useSiteSettings } from '@/lib/settings-context';
import type { Order } from '@/lib/types';

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { whatsappCountryCode, whatsappNumber } = useSiteSettings();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getOrderById(params.id)
      .then((o) => !cancelled && setOrder(o))
      .catch(() => !cancelled && setOrder(null));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (order === undefined) {
    return <div className="container-page py-24 text-center text-muted">Cargando tu pedido...</div>;
  }

  if (order === null) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-heading text-2xl font-bold text-ink">No encontramos ese pedido</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const itemsSummary = order.items
    .map((i) => `- ${i.title} (talla ${i.size}, ${i.color}) x${i.quantity}`)
    .join('\n');

  const waMessage = `Hola! Acabo de hacer el pedido *${order.orderNumber}*\n\n${itemsSummary}\n\nTotal: ${formatPrice(
    order.total,
  )}\nMétodo de pago: ${order.paymentMethod === 'contra_entrega' ? 'Pago contra entrega' : 'Transferencia'}\n\nMis datos:\n${order.customer.name}\n${order.customer.phone}\n${order.customer.address}, ${order.customer.city}, ${order.customer.department}`;

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-white">
          ✓
        </div>
        <h1 className="font-heading text-3xl font-bold text-ink">¡Pedido recibido!</h1>
        <p className="mt-2 text-muted">
          Tu número de pedido es <strong className="text-ink">{order.orderNumber}</strong>
        </p>

        <div className="mt-8 rounded-card border-2 border-primary bg-primary-light/10 p-5 text-left">
          <p className="mb-3 text-sm font-bold text-ink">
            📲 Un último paso — confirma tu pedido por WhatsApp para que lo alistemos hoy mismo:
          </p>
          <a
            href={whatsappLinkTo(whatsappNumber, waMessage, whatsappCountryCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full"
          >
            💬 Confirmar pedido por WhatsApp
          </a>
        </div>

        <div className="mt-8 rounded-card bg-white p-6 text-left shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Resumen de tu pedido</h2>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  {item.title} × {item.quantity}
                  <span className="block text-xs text-muted">
                    Talla {item.size} · {item.color}
                  </span>
                </span>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <div className="mt-4 border-t border-border pt-3 text-sm text-muted">
            <p>{order.customer.name} · {order.customer.phone}</p>
            <p>{order.customer.address}, {order.customer.city}, {order.customer.department}</p>
          </div>
        </div>

        <Link href="/catalogo" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
}
