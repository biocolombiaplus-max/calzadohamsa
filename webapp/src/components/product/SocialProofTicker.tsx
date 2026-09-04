'use client';

import { useEffect, useState } from 'react';

const NAMES = ['Valentina R.', 'Camila S.', 'Isabella T.', 'Mariana G.', 'Paula V.', 'Sofía A.'];
const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Cúcuta', 'Barranquilla', 'Bucaramanga'];

export default function SocialProofTicker({ productTitle }: { productTitle: string }) {
  const [visible, setVisible] = useState(false);
  const [entry, setEntry] = useState({ name: NAMES[0], city: CITIES[0], time: '3 minutos' });

  useEffect(() => {
    function showRandom() {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const time = `${Math.floor(Math.random() * 20) + 1} minutos`;
      setEntry({ name, city, time });
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }

    const first = setTimeout(showRandom, 2000);
    const interval = setInterval(showRandom, 14000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-3 rounded-card border border-border bg-white px-4 py-3 shadow-soft transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <span className="text-xl">🛍️</span>
      <p className="text-xs text-ink sm:text-sm">
        <strong>{entry.name}</strong> de {entry.city} compró <strong>{productTitle}</strong> hace {entry.time}
      </p>
    </div>
  );
}
