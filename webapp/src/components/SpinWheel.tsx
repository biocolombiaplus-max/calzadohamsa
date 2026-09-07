'use client';

import { useEffect, useRef, useState } from 'react';
import { saveWonCoupon } from '@/lib/coupon';

type Prize =
  | { type: 'discount'; percent: number; code: string; weight: number; color: string }
  | { type: 'retry'; weight: number; color: string };

// El orden alterna premio / "sigue intentando" para que el disco se vea
// balanceado. El "weight" controla qué tan seguido cae cada casilla (no es
// un sorteo parejo): el 5% está pensado para salir la mayoría de las veces,
// el 10% es el premio "raro" y las dos de "sigue intentando" reparten el
// resto para que el juego no se sienta como una victoria garantizada.
const PRIZES: Prize[] = [
  { type: 'discount', percent: 5, code: 'HAMSA5', weight: 65, color: '#FFB800' },
  { type: 'retry', weight: 15, color: '#7C3AED' },
  { type: 'discount', percent: 10, code: 'HAMSA10', weight: 5, color: '#FF3D71' },
  { type: 'retry', weight: 15, color: '#06B6D4' },
];

const GOLD = '#F4C542';
const SLICE = 360 / PRIZES.length;
const LIGHTS = 12;
const SESSION_KEY = 'hamsa-spin-shown';

function pickWeightedIndex(): number {
  const total = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PRIZES.length; i++) {
    if (r < PRIZES[i].weight) return i;
    r -= PRIZES[i].weight;
  }
  return PRIZES.length - 1;
}

export default function SpinWheel() {
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
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
    const prizeIndex = pickWeightedIndex();
    const extraSpins = 5;
    const targetRotation = 360 * extraSpins + (360 - prizeIndex * SLICE - SLICE / 2);
    setRotation(targetRotation);
    setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[prizeIndex];
      setResult(prize);
      if (prize.type === 'discount') {
        saveWonCoupon(prize.code, prize.percent);
      }
    }, 4000);
  }

  if (!visible) return null;

  const won = result?.type === 'discount' ? result : null;

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
                className="relative h-full w-full overflow-hidden rounded-full transition-transform duration-[4000ms] ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${PRIZES.map(
                    (p, i) => `${p.color} ${i * SLICE}deg ${(i + 1) * SLICE}deg`,
                  ).join(', ')})`,
                }}
              >
                {/* Divisores blancos entre casillas */}
                {PRIZES.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1/2 w-[3px] -translate-x-1/2 bg-white/85"
                    style={{ transformOrigin: 'top center', transform: `rotate(${i * SLICE}deg)` }}
                  />
                ))}

                {/* Etiquetas */}
                {PRIZES.map((p, i) => {
                  const mid = i * SLICE + SLICE / 2;
                  return (
                    <div key={i} className="absolute inset-0" style={{ transform: `rotate(${mid}deg)` }}>
                      <div className="absolute left-1/2 top-[38px] w-[72px] -translate-x-1/2 text-center leading-tight text-white">
                        {p.type === 'discount' ? (
                          <>
                            <div className="text-xl font-extrabold drop-shadow-sm">{p.percent}%</div>
                            <div className="text-[10px] font-bold tracking-wide drop-shadow-sm">OFF</div>
                          </>
                        ) : (
                          <div className="text-[10px] font-extrabold uppercase tracking-wide drop-shadow-sm">
                            Sigue
                            <br />
                            intentando
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <p className="mb-2 text-sm font-semibold text-ink">¡Felicidades! Ganaste {won.percent}% de descuento</p>
            <div className="rounded-card border-2 border-dashed p-[2px]" style={{ borderColor: GOLD }}>
              <div className="rounded-[10px] bg-white px-4 py-3 font-mono text-lg font-bold text-primary">
                {won.code}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              Se aplica automáticamente al pagar — tienes 24 horas para usarlo.
            </p>
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
