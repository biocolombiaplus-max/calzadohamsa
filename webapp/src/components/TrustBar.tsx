'use client';

import { useSiteSettings } from '@/lib/settings-context';

export default function TrustBar() {
  const { trustItems } = useSiteSettings();

  return (
    <div className="border-y border-border bg-white">
      <div className="container-page grid grid-cols-2 gap-4 py-5 sm:grid-cols-5">
        {trustItems.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
            <span className="text-2xl">{item.icon}</span>
            <span>
              <span className="block text-xs font-bold text-ink sm:text-sm">{item.title}</span>
              <span className="block text-[11px] text-muted">{item.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
