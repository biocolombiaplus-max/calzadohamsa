'use client';

import { useSiteSettings } from '@/lib/settings-context';

const EDGE_FADE = 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)';

export default function AnnouncementBar() {
  const { announcementMessages } = useSiteSettings();
  const loop = [...announcementMessages, ...announcementMessages];

  return (
    <div
      className="overflow-hidden bg-primary py-2.5 text-white"
      style={{ WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE }}
    >
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-widest">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-primary-light">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
