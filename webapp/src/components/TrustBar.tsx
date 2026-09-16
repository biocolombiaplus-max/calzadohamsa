'use client';

import { useSiteSettings } from '@/lib/settings-context';

export default function TrustBar() {
  const { trustItems } = useSiteSettings();

  return (
    <div className="border-y border-border bg-white">
      <div className="container-page grid grid-cols-2 gap-x-4 gap-y-3 py-4 sm:grid-cols-5 sm:gap-3 sm:py-5">
        {trustItems.map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light/20 text-base">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-ink sm:text-sm">{item.title}</span>
              <span className="block truncate text-[10px] text-muted sm:text-[11px]">{item.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
