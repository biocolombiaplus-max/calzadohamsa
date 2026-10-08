'use client';

import { useState } from 'react';
import { useSiteSettings } from '@/lib/settings-context';
import SafeImage from '@/components/SafeImage';

// Capturas reales de WhatsApp de clientas felices, dentro de un marco de
// celular — como lo muestran las tiendas grandes. Se administran en
// Configuración → Capturas de WhatsApp. Aparece con al menos 1 captura.
export default function ChatProofs() {
  const { chatProofs } = useSiteSettings();
  const [open, setOpen] = useState<number | null>(null);
  const photos = chatProofs.photos.filter(Boolean);
  if (!chatProofs.enabled || photos.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-ink py-14 text-cream sm:py-20">
      <span className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,211,102,0.18),transparent_70%)]" />
      <span className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(169,103,58,0.25),transparent_70%)]" />
      <div className="container-page relative">
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-whatsapp">
          💬 Clientas reales · mensajes reales
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">{chatProofs.heading}</h2>
        {chatProofs.subheading && <p className="mt-1 text-sm text-cream/60">{chatProofs.subheading}</p>}

        <div className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label="Ver captura completa"
              className="group relative w-[200px] shrink-0 snap-center rounded-[30px] bg-[#1c1c1e] p-[7px] shadow-lift ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1 sm:w-[230px]"
            >
              <span className="relative block aspect-[9/17] overflow-hidden rounded-[24px] bg-[#0b141a]">
                <span className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
                <SafeImage src={src} alt="Mensaje de una clienta por WhatsApp" fill sizes="240px" className="object-cover object-top" />
              </span>
              <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-whatsapp px-2.5 py-1 text-[10px] font-extrabold text-white shadow-soft">
                ✓ Clienta real
              </span>
            </button>
          ))}
        </div>
        <p className="mt-5 text-[11px] text-cream/40">Ocultamos números y fotos de perfil para cuidar la privacidad de nuestras clientas.</p>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <span className="relative block h-[88vh] w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <SafeImage src={photos[open]} alt="Mensaje de una clienta por WhatsApp" fill sizes="420px" className="object-contain" />
          </span>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open - 1 + photos.length) % photos.length);
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white"
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open + 1) % photos.length);
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-xl text-white"
                aria-label="Siguiente"
              >
                ›
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white"
          >
            ✕ Cerrar
          </button>
        </div>
      )}
    </section>
  );
}
