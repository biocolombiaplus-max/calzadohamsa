'use client';

import Link from 'next/link';
import { useMemo, useState, type RefObject } from 'react';
import type { Product } from '@/lib/types';
import { absoluteProductUrl, classNames, cloudinaryFill, formatPrice, resolveColorImage, whatsappLinkTo, withWebOrigin } from '@/lib/utils';
import { useSiteSettings } from '@/lib/settings-context';
import { isWompiConfigured } from '@/lib/wompi';
import { trackVisitorWhatsAppOrder } from '@/lib/visitor';
import SafeImage from '@/components/SafeImage';
import QuickBuyModal from './QuickBuyModal';
import WhatsAppPhoneModal from './WhatsAppPhoneModal';

export default function BuyBox({
  product,
  onColorChange,
  ctaRef,
}: {
  product: Product;
  onColorChange?: (colorName: string) => void;
  ctaRef?: RefObject<HTMLDivElement>;
}) {
  const { whatsappCountryCode, whatsappNumber, trustItems, bundle2x1 } = useSiteSettings();
  const [size, setSize] = useState(product.sizes[0] ?? '');
  const [color, setColor] = useState(product.colors[0]?.name ?? '');

  function handleColorChange(colorName: string) {
    setColor(colorName);
    onColorChange?.(colorName);
  }
  const [quantity, setQuantity] = useState(1);
  const [quickBuyMode, setQuickBuyMode] = useState<'cod' | 'wompi' | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

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
      image: resolveColorImage(product, color) || product.images[0] || '',
      size,
      color,
      quantity,
    };
  }

  function handleBuyNow() {
    setQuickBuyMode('cod');
  }

  function handleBuyWompi() {
    setQuickBuyMode('wompi');
  }

  // El link de la ficha va al final del mensaje: cuando la clienta lo manda,
  // WhatsApp arma solo una vista previa con la foto del producto — no se
  // puede adjuntar un archivo real desde un link wa.me, pero esto logra el
  // mismo efecto de "llega con foto" sin necesitar la API de Meta.
  const waMessage = withWebOrigin(
    `Hola, quiero pedir: ${product.title}${size ? ` (talla ${size})` : ''}${
      color ? ` color ${color}` : ''
    }\n${absoluteProductUrl(product.slug, color)}`,
  );

  function handlePhoneSubmit(phone: string) {
    trackVisitorWhatsAppOrder({
      title: product.title,
      image: resolveColorImage(product, color) || product.images[0] || '',
      size,
      color,
      phone,
    });
    setShowPhoneModal(false);
    window.open(whatsappLinkTo(whatsappNumber, waMessage, whatsappCountryCode), '_blank');
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold text-ink sm:text-4xl">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice as number)}</span>
              <span className="bg-urgent px-2 py-1 text-xs font-bold text-white">-{discountPercent}%</span>
            </>
          )}
        </div>
        {(!!product.reviewsCount || !!product.soldCount) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {!!product.reviewsCount && (
              <a href="#resenas" className="flex items-center gap-1 hover:text-ink">
                ★★★★★ <span>{product.reviewsCount} reseñas</span>
              </a>
            )}
            {!!product.reviewsCount && !!product.soldCount && <span className="hidden sm:inline">·</span>}
            {!!product.soldCount && <span>{product.soldCount} vendidos</span>}
          </div>
        )}
      </div>

      <p className="border-y border-border py-3 text-xs font-semibold uppercase tracking-wide text-ink">
        Envío gratis · Pago contra entrega
      </p>

      {product.stock > 0 && product.stock <= 15 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-urgent">Quedan {product.stock} unidades en esta talla</p>
          <div className="h-1 w-full overflow-hidden bg-border">
            <div className="h-full bg-urgent" style={{ width: `${100 - stockPct}%` }} />
          </div>
        </div>
      )}

      <Link
        href="/oferta-2x1"
        className="flex items-center justify-between gap-2 border border-border px-4 py-3 text-xs font-semibold text-ink transition-colors hover:border-ink sm:text-sm"
      >
        <span>
          Lleva 2 pares por <strong>{formatPrice(bundle2x1.price)}</strong> + envío gratis
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
                  'flex h-11 min-w-[44px] items-center justify-center border px-3 text-sm font-semibold transition-colors',
                  size === s ? 'border-ink bg-ink text-cream' : 'border-border bg-white text-ink hover:border-ink',
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
          <div className="flex flex-wrap gap-3">
            {product.colors.map((c) => {
              const thumb = resolveColorImage(product, c.name);
              const selected = color === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleColorChange(c.name)}
                  aria-label={c.name}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={classNames('block h-8 w-8 rounded-full border transition-colors', selected ? 'border-ink' : 'border-border')}
                    style={{ backgroundColor: c.hex }}
                  />
                  {thumb && (
                    <span
                      className={classNames(
                        'relative block h-11 w-11 overflow-hidden border transition-colors',
                        selected ? 'border-ink' : 'border-border',
                      )}
                    >
                      <SafeImage src={cloudinaryFill(thumb, 100)} alt={c.name} fill sizes="44px" className="object-cover" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-ink">Cantidad</p>
        <div className="flex items-center border border-border">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg">
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="h-10 w-10 text-lg">
            +
          </button>
        </div>
      </div>

      <div ref={ctaRef} className="space-y-3">
        {isWompiConfigured() && (
          <div className="relative">
            <span className="absolute -top-2.5 left-4 bg-cream px-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Recomendado
            </span>
            <button onClick={handleBuyWompi} className="btn-primary w-full flex-col gap-0.5 py-4 text-sm">
              <span>Pagar en línea — Ahorra 5%</span>
              <span className="block text-[11px] font-semibold normal-case tracking-normal text-cream/80">
                {formatPrice(Math.round(product.price * quantity * 0.95))} con tarjeta, PSE o Nequi
              </span>
            </button>
          </div>
        )}
        <button onClick={handleBuyNow} className={isWompiConfigured() ? 'btn-secondary w-full text-sm' : 'btn-primary w-full text-sm'}>
          Comprar ya — Pago contra entrega
        </button>
        <button type="button" onClick={() => setShowPhoneModal(true)} className="btn-whatsapp w-full">
          Pedir por WhatsApp
        </button>
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

      <div className="border border-border p-4">
        <p className="text-sm font-bold text-ink">Compra 100% garantizada</p>
        <p className="mt-1 text-xs text-muted">
          Si tu pedido no llega o no es el correcto, te lo resolvemos sin preguntas.
        </p>
      </div>

      {quickBuyMode && (
        <QuickBuyModal
          items={[buildItem()]}
          mode={quickBuyMode}
          title={quickBuyMode === 'wompi' ? '⚡ Confirma tu pago en línea' : undefined}
          onClose={() => setQuickBuyMode(null)}
        />
      )}

      {showPhoneModal && (
        <WhatsAppPhoneModal
          countryCode={whatsappCountryCode}
          onSubmit={handlePhoneSubmit}
          onClose={() => setShowPhoneModal(false)}
        />
      )}
    </div>
  );
}
