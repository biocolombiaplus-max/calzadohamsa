'use client';

import { useEffect, useState } from 'react';

export default function UrgencyTimer({ initialMinutes = 14 }: { initialMinutes?: number }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60 + 59);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : initialMinutes * 60 + 59));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialMinutes]);

  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-between gap-3 rounded-card bg-urgent/10 px-4 py-3 text-urgent">
      <span className="flex items-center gap-2 text-xs font-bold sm:text-sm">
        <span className="h-2 w-2 animate-pulseSoft rounded-full bg-urgent" />
        ⏰ Precio especial termina en
      </span>
      <span className="font-mono text-lg font-extrabold">
        {m}:{s}
      </span>
    </div>
  );
}
