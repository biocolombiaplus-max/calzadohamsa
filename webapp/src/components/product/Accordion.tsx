'use client';

import { useState } from 'react';

export function AccordionItem({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-bold text-ink sm:text-base">{title}</span>
        <span className="text-xl leading-none text-primary">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
}

export default function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card border border-border bg-white px-5">{children}</div>;
}
