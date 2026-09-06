'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { classNames, formatPrice, whatsappLinkTo } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { useSiteSettings } from '@/lib/settings-context';
import UrgencyTimer from './UrgencyTimer';
import QuickBuyModal from './QuickBuyModal';

export default function BuyBox({ product }: { product: Product }) {
  const { whatsappCountryCode, whatsappNumber, trustItems, bundle2x1 } = useSiteSettings();
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState(product.sizes[0] ?? '');
  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;
  const stockPct = useMemo(() => Math.min(100, Math.max(6, product.stock)), [product.stock]);

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0] ?? '',
      size,
      color,
      quantity,
    };
  }

  function handleAddToCart() {
    addItem(buildItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    setShowQuickBuy(true);
  }

  const waMessage = `Hola, quiero pedir: ${product.title}${size ? ` (talla ${size})` : ''}${
    color ? ` color ${color}` : ''
  }`;

  return (
    <div className="space-y-5">
      <UrgencyTimer />

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-extrabold text-primary sm:text-4xl">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice as number)}</span>
              <span className="rounded-full bg-urgent px-2.5 py-1 text-xs font-extrabold text-white">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1 text-primary">
            ★★★★★ <span className="text-ink">{product.reviewsCount ?? 87} reseñas</span>
          </span>
          <span className="hidden sm:inline">·</span>
          <span>{product.soldCount ?? 342} vendidos</span>
        </div>
      </div>

      {product.stock > 0 && product.stock <= 15 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-urgent">
            ⚡ ¡Alta demanda! Quedan {product.stock} unidades — asegura la tuya
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-urgent" style={{ width: `${100 - stockPct}%` }} />
          </div>
        </div>
      )}

      <Link
        href="/oferta-2x1"
        className="flex items-center justify-between gap-2 rounded-card bg-gradient-to-r from-urgent/10 to-primary/10 px-4 py-3 text-xs font-semibold text-ink transition-colors hover:from-urgent/15 hover:to-primary/15 sm:text-sm"
      >
        <span>
          🔥 Lleva <strong>2 pares</strong> por{' '}
          <strong className="text-primary">{formatPrice(bundle2x1.price)}</strong> + envío gratis
        </span>
        <span className="shrink-0 font-bold text-primary">Ver oferta →</span>
      </Link>

      {product.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Talla: {size}</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={classNames(
                  'flex h-11 min-w-[44px] items-center justify-center rounded-lg border-2 px-3 text-sm font-semibold transition-colors',
                  size === s ? 'border-primary bg-primary text-white' : 'border-border bg-white text-ink hover:border-primary',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Color: {color}</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                className={classNames(
                  'h-10 w-10 rounded-full border-2 transition-transform',
                  color === c.name ? 'scale-110 border-primary' : 'border-border',
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-ink">Cantidad</p>
        <div className="flex items-center rounded-lg border border-border">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg">
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="h-10 w-10 text-lg">
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={handleBuyNow} className="btn-primary w-full text-base shadow-lift">
          💵 Comprar ya — Pago contra entrega
        </button>
        <button onClick={handleAddToCart} className="btn-secondary w-full">
          {added ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
        </button>
        <a
          href={whatsappLinkTo(whatsappNumber, waMessage, whatsappCountryCode)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp w-full"
        >
          💬 Pedir por WhatsApp
        </a>
        <p className="text-center text-xs text-muted">Respuesta inmediata · Sin tarjeta, sin anticipo</p>
      </div>

      {trustItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-xs text-muted">
          {trustItems.slice(0, 4).map((item) => (
            <span key={item.title} className="flex items-center gap-1.5">
              <span>{item.icon}</span>
              <span className="font-semibold text-ink">{item.title}</span>
            </span>
          ))}
        </div>
      )}

      <div className="rounded-card border border-border bg-cream-alt p-4">
        <p className="text-sm font-bold text-ink">🛡️ Compra 100% garantizada</p>
        <p className="mt-1 text-xs text-muted">
          Si tu pedido no llega o no es el correcto, te lo resolvemos sin preguntas.
        </p>
      </div>

      {showQuickBuy && <QuickBuyModal items={[buildItem()]} onClose={() => setShowQuickBuy(false)} />}
    </div>
  );
}
