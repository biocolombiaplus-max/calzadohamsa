'use client';

import { useEffect, useRef, useState } from 'react';

const PRIZES = [
  { label: '5% OFF', code: 'HAMSA5', color: '#A9673A' },
  { label: 'Sigue intentando', code: null, color: '#F5E6CE' },
  { label: '10% OFF', code: 'HAMSA10', color: '#8C5429' },
  { label: 'Envío gratis', code: 'ENVIOGRATIS', color: '#C9A06C' },
  { label: 'Sigue intentando', code: null, color: '#F5E6CE' },
  { label: '15% OFF', code: 'HAMSA15', color: '#7A4A22' },
];

const SLICE = 360 / PRIZES.length;
const SESSION_KEY = 'hamsa-spin-shown';

export default function SpinWheel() {
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; code: string | null } | null>(null);
  const [rotation, setRotation] = useState(0);
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    function handleExit(e: MouseEvent) {
      if (e.clientY <= 0 && !shownRef.current) {
        shownRef.current = true;
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    }

    const fallback = setTimeout(() => {
      if (!shownRef.current) {
        shownRef.current = true;
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, '1');
      }
    }, 25000);

    document.addEventListener('mouseleave', handleExit);
    return () => {
      document.removeEventListener('mouseleave', handleExit);
      clearTimeout(fallback);
    };
  }, []);

  function spin() {
    if (spinning || result) return;
    setSpinning(true);
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const extraSpins = 5;
    const targetRotation = 360 * extraSpins + (360 - prizeIndex * SLICE - SLICE / 2);
    setRotation(targetRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(PRIZES[prizeIndex]);
    }, 4000);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="relative w-full max-w-md rounded-card bg-cream p-6 text-center shadow-lift sm:p-8">
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"
        >
          ✕
        </button>

        <h3 className="font-heading text-2xl font-bold text-ink">¡Espera! 🎁</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          Gira la ruleta y llévate un descuento exclusivo antes de irte
        </p>

        <div className="relative mx-auto my-6 h-64 w-64">
          <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-urgent" />
          <div
            className="h-full w-full rounded-full border-[6px] border-white shadow-soft transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${PRIZES.map(
                (p, i) => `${p.color} ${i * SLICE}deg ${(i + 1) * SLICE}deg`,
              ).join(', ')})`,
            }}
          >
            {PRIZES.map((p, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 w-20 origin-left text-[11px] font-bold text-white"
                style={{ transform: `rotate(${i * SLICE + SLICE / 2}deg) translateX(20px)` }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {!result ? (
          <button onClick={spin} disabled={spinning} className="btn-primary w-full disabled:opacity-60">
            {spinning ? 'Girando...' : '🎡 Girar la ruleta'}
          </button>
        ) : result.code ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">¡Felicidades! Ganaste: {result.label}</p>
            <div className="rounded-card border-2 border-dashed border-primary bg-white px-4 py-3 font-mono text-lg font-bold text-primary">
              {result.code}
            </div>
            <p className="mt-2 text-xs text-muted">Usa este código al finalizar tu compra</p>
            <button onClick={() => setVisible(false)} className="btn-secondary mt-4 w-full">
              Ir de compras
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Casi lo logras, ¡vuelve a intentarlo la próxima vez!</p>
            <button onClick={() => setVisible(false)} className="btn-secondary w-full">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
