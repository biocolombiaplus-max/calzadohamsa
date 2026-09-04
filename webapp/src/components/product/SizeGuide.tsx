'use client';

import { useState } from 'react';

const SIZE_TABLE = [
  { size: '35', cm: '22.0' },
  { size: '36', cm: '22.7' },
  { size: '37', cm: '23.4' },
  { size: '38', cm: '24.1' },
  { size: '39', cm: '24.8' },
  { size: '40', cm: '25.5' },
];

export default function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border border-border bg-white p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-bold text-ink">📏 Guía de tallas — Encuentra la tuya</span>
        <span className="text-lg text-primary">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted">
                <th className="py-1.5">Talla</th>
                <th className="py-1.5">Largo del pie (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_TABLE.map((row) => (
                <tr key={row.size} className="border-b border-border/60">
                  <td className="py-1.5 font-semibold text-ink">{row.size}</td>
                  <td className="py-1.5 text-muted">{row.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 rounded-lg bg-cream-alt p-3 text-xs text-muted">
            ¿Entre dos tallas? Si tienes pie ancho elige la más grande. Si es estrecho, la más pequeña. El primer
            cambio de talla es <strong className="text-ink">GRATIS</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
