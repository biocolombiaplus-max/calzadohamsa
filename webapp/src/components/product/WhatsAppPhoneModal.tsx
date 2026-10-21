'use client';

import { useState } from 'react';

// Paso rápido antes de abrir WhatsApp: un solo campo (el número), con el
// código de país ya puesto, para no perder tiempo. El número queda
// guardado en el perfil del visitante — sirve para remarketing y para
// recuperar carritos abandonados por WhatsApp más adelante.
export default function WhatsAppPhoneModal({
  countryCode,
  onSubmit,
  onClose,
}: {
  countryCode: string;
  onSubmit: (phone: string) => void;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');
  const valid = digits.length >= 7;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit(digits);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-card bg-cream p-6 shadow-lift sm:rounded-card"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink">¿A qué número te escribimos?</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-ink">
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">Para enviarte tu pedido por WhatsApp y avisarte si algo cambia.</p>

        <div className="flex gap-2">
          <span className="flex items-center border border-border bg-white px-3 text-sm font-semibold text-muted">
            +{countryCode}
          </span>
          <input
            autoFocus
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="300 123 4567"
            className="flex-1 border border-border px-4 py-3 text-base focus:border-ink focus:outline-none"
          />
        </div>

        <button type="submit" disabled={!valid} className="btn-whatsapp mt-4 w-full text-sm disabled:opacity-50">
          Continuar a WhatsApp →
        </button>
        <p className="mt-2 text-center text-[11px] text-muted">Nunca compartimos tu número. Cero spam.</p>
      </form>
    </div>
  );
}
