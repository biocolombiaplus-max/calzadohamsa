import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import MetaPixel from '@/components/MetaPixel';
import VisitorTracker from '@/components/VisitorTracker';
import RewardCouponHandler from '@/components/RewardCouponHandler';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';
const TITLE = `${STORE_NAME} — Sandalias y Zapatos para Mujer en Colombia`;
const DESCRIPTION =
  'Sandalias y zapatos de moda para mujer en Colombia: el calzado perfecto para completar tu outfit. Pago contra entrega, envío gratis y cambio de talla sin costo. +2.400 clientas felices nos recomiendan.';
// Palabras clave reales que una mujer colombiana escribiría en Google para
// llegar a esta tienda — no solo "sandalias", sino cómo la gente realmente
// busca (zapatos de mujer, calzado femenino, outfit, moda).
const KEYWORDS = [
  'sandalias para mujer',
  'sandalias de mujer Colombia',
  'zapatos de mujer',
  'calzado femenino',
  'sandalias de moda',
  'zapatos para mujer Colombia',
  'moda femenina',
  'outfit mujer',
  'accesorios mujer',
  'sandalias cómodas',
  'calzado para mujer online',
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${STORE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: STORE_NAME,
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: STORE_NAME,
  },
};

// Le dice a Google qué es el sitio (tienda online, no un blog ni una
// empresa de servicios) y cómo se llama — es lo que puede hacer que tu
// nombre aparezca con el logo y el buscador propio en los resultados.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: STORE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'Colombia' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#A9673A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body">
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <MetaPixel />
        <VisitorTracker />
        <RewardCouponHandler />
        {children}
      </body>
    </html>
  );
}
