'use client';

import { whatsappLink } from '@/lib/utils';

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink('Hola, quiero información sobre sus sandalias')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comprar por WhatsApp"
      className="fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-110"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.15L2 22l5.09-1.53a9.87 9.87 0 0 0 4.95 1.34h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.83 14.02c-.24.68-1.4 1.3-1.93 1.35-.5.05-1 .25-3.42-.72-2.9-1.16-4.75-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.58-.36.77-.36s.38 0 .55.01c.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.29.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.94 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.81.87.26.14.44.2.5.32.06.12.06.68-.18 1.36Z" />
      </svg>
    </a>
  );
}
