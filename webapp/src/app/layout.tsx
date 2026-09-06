import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';
const DESCRIPTION =
  'Sandalias elegantes y cómodas para la mujer colombiana. Pago contra entrega, cambio de talla sin costo y 2×1 con envío gratis.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE_NAME} — Sandalias y calzado femenino`,
    template: `%s — ${STORE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    title: `${STORE_NAME} — Sandalias y calzado femenino`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: STORE_NAME,
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE_NAME} — Sandalias y calzado femenino`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#A9673A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body">{children}</body>
    </html>
  );
}
