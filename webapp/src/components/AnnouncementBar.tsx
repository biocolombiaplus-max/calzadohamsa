'use client';

import { useSiteSettings } from '@/lib/settings-context';

const EDGE_FADE = 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)';

export default function AnnouncementBar() {
  const { announcementMessages } = useSiteSettings();
  const loop = [...announcementMessages, ...announcementMessages];

  return (
    <div
      className="overflow-hidden bg-ink py-2.5 text-cream"
      style={{ WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE }}
    >
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.15em]">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-cream/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
