import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';

// Deja que Google indexe toda la tienda, pero no el panel administrativo
// ni las rutas internas de la API — y le dice dónde está el sitemap para
// que encuentre todas las páginas más rápido.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
