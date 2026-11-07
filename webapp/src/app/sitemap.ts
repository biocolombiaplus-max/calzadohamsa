import type { MetadataRoute } from 'next';
import { getActiveProductsServer } from '@/lib/productsServer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';

// Le dice a Google qué páginas existen y con qué frecuencia cambian — sin
// esto, Google tiene que ir descubriendo las páginas solo (mucho más
// lento) o directamente se pierde de algunas. Se regenera solo cada vez
// que Google lo pide, así que siempre trae los productos activos de hoy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProductsServer().catch(() => []);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/catalogo`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/oferta-2x1`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/producto/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
