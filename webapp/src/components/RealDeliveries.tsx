'use client';

import { useState } from 'react';
import { useSiteSettings } from '@/lib/settings-context';
import SafeImage from '@/components/SafeImage';

// "Entregas reales": fotos de pedidos empacados/entregados que sube la
// administradora desde el panel. Solo aparece con al menos 1 foto real.
export default function RealDeliveries() {
  const { realDeliveries, storeName } = useSiteSettings();
  const [open, setOpen] = useState<string | null>(null);
  const photos = realDeliveries.photos.filter(Boolean);
  if (!realDeliveries.enabled || photos.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="container-page">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Clientas reales · pedidos reales</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">{realDeliveries.heading}</h2>
        <div className="no-scrollbar -mx-5 mt-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {photos.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(src)}
              className="relative h-44 w-44 shrink-0 snap-start overflow-hidden rounded-card bg-cream-alt shadow-soft sm:h-56 sm:w-56"
              aria-label="Ver foto de entrega"
            >
              <SafeImage src={src} alt={`Entrega real de ${storeName}`} fill sizes="224px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      {open && (
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/85 p-4"
          aria-label="Cerrar"
        >
          <span className="relative block h-[80vh] w-full max-w-lg">
            <SafeImage src={open} alt="Entrega real" fill sizes="512px" className="object-contain" />
          </span>
        </button>
      )}
    </section>
  );
}
