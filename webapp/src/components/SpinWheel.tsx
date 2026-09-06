'use client';

import { useEffect, useRef, useState } from 'react';

const PRIZES = [
  { label: '5% OFF', code: 'HAMSA5', color: '#C98A0C' },
  { label: 'Sigue intentando', code: null, color: '#C4302B' },
  { label: '10% OFF', code: 'HAMSA10', color: '#A9673A' },
  { label: 'Envío gratis', code: 'ENVIOGRATIS', color: '#9C2B57' },
  { label: 'Sigue intentando', code: null, color: '#B5451B' },
  { label: '15% OFF', code: 'HAMSA15', color: '#7A4A22' },
];

const GOLD = '#F4C542';
const SLICE = 360 / PRIZES.length;
const LIGHTS = 12;
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

  const won = result?.code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
      <div className="relative w-full max-w-md rounded-card bg-gradient-to-b from-cream to-cream-alt p-6 text-center shadow-lift sm:p-8">
        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-soft"
        >
          ✕
        </button>

        <span className="mx-auto mb-2 inline-flex animate-pulseSoft items-center gap-1 rounded-full bg-urgent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
          🔥 Solo por hoy
        </span>
        <h3 className="font-heading text-2xl font-bold text-ink sm:text-3xl">¡Gira y gana! 🎁</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          Todas las clientas ganan algo. Descubre tu premio antes de irte.
        </p>

        <div className="relative mx-auto my-7 h-72 w-72">
          {/* Luces parpadeantes alrededor */}
          {Array.from({ length: LIGHTS }).map((_, i) => {
            const angle = (360 / LIGHTS) * i;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 animate-twinkle rounded-full"
                style={{
                  background: i % 2 === 0 ? GOLD : '#ffffff',
                  transform: `rotate(${angle}deg) translate(138px) rotate(-${angle}deg)`,
                  animationDelay: `${i * 0.12}s`,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? GOLD : '#fff'}`,
                }}
              />
            );
          })}

          {/* Puntero */}
          <div className="absolute left-1/2 top-1 z-20 -translate-x-1/2 drop-shadow-md">
            <div
              className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent"
              style={{ borderTopColor: GOLD }}
            />
            <div className="mx-auto -mt-1 h-0 w-0 border-x-[7px] border-t-[12px] border-x-transparent border-t-urgent" />
          </div>

          {/* Anillo dorado exterior */}
          <div
            className="absolute inset-3 rounded-full p-[5px] shadow-lift"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #A9670C, ${GOLD})` }}
          >
            <div className="h-full w-full rounded-full bg-white p-[4px]">
              <div
                className="relative h-full w-full rounded-full transition-transform duration-[4000ms] ease-out"
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
                    className="absolute left-1/2 top-1/2 w-24 origin-left text-[11px] font-extrabold uppercase tracking-tight text-white sm:text-xs"
                    style={{
                      transform: `rotate(${i * SLICE + SLICE / 2}deg) translateX(22px)`,
                      textShadow: '0 1px 3px rgba(0,0,0,0.55)',
                    }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Centro */}
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xl shadow-soft"
            style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${GOLD})` }}
          >
            🎁
          </div>
        </div>

        {!result ? (
          <button
            onClick={spin}
            disabled={spinning}
            className="relative w-full overflow-hidden rounded-card bg-gradient-to-r from-urgent to-primary px-6 py-3.5 text-base font-bold text-white shadow-lift transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {!spinning && (
              <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
            <span className="relative">{spinning ? 'Girando...' : '🎡 Girar la ruleta'}</span>
          </button>
        ) : won ? (
          <div className="relative animate-popIn">
            <span className="pointer-events-none absolute -top-2 left-1/4 animate-sparkle text-xl">✨</span>
            <span
              className="pointer-events-none absolute -top-1 right-1/4 animate-sparkle text-xl"
              style={{ animationDelay: '0.3s' }}
            >
              🎉
            </span>
            <p className="mb-2 text-sm font-semibold text-ink">¡Felicidades! Ganaste: {result.label}</p>
            <div className="rounded-card border-2 border-dashed p-[2px]" style={{ borderColor: GOLD }}>
              <div className="rounded-[10px] bg-white px-4 py-3 font-mono text-lg font-bold text-primary">
                {result.code}
              </div>
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
