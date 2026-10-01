import { NextResponse } from 'next/server';
import { cloudinaryFill, cloudinaryOriginal } from '@/lib/utils';
import { getBranding } from '@/lib/branding';

// Feed de catálogo para Meta Commerce Manager (formato RSS / Google
// Shopping, el que Meta recomienda para "programar feeds de datos") — vive
// aparte del catálogo viejo de Shopify y siempre refleja los productos
// REALES y activos de calzadohamsa.com en este momento, porque los lee en
// vivo de Firestore en cada visita (con caché de 30 min). Cuando agregues
// o edites un producto en /admin/productos, el feed se actualiza solo —
// no hay que tocar nada aquí ni en Meta.
//
// Esta ruta corre en el servidor y no puede usar el SDK de cliente de
// Firebase (src/lib/firebase.ts está deliberadamente deshabilitado fuera
// del navegador) — lee la colección "products" vía la API REST de
// Firestore, la misma técnica que ya usan src/lib/branding.ts y
// /api/send-push, posible porque la regla de seguridad ya permite lectura
// pública de "products".

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';

function unwrapValue(value: any): any {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return unwrapFields(value.mapValue.fields ?? {});
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(unwrapValue);
  return null;
}

function unwrapFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) result[key] = unwrapValue(value);
  return result;
}

interface FeedProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  noCropImages: string[];
  stock: number;
  active: boolean;
}

// Catálogos de verdad pueden tener más productos de los que la API de
// Firestore devuelve en una sola página — se van pidiendo las páginas
// siguientes hasta traerlos todos, para que el feed nunca se quede corto
// a medida que la tienda crece.
async function fetchAllProductDocs(projectId: string): Promise<any[]> {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`;
  const docs: any[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(base);
    url.searchParams.set('pageSize', '200');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) break;
    const data = await res.json();
    docs.push(...(data.documents ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return docs;
}

async function fetchActiveProducts(): Promise<FeedProduct[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const docs = await fetchAllProductDocs(projectId);

  return docs
    .map((doc: any): FeedProduct => {
      const fields = unwrapFields(doc.fields ?? {});
      return {
        id: doc.name.split('/').pop(),
        slug: fields.slug ?? '',
        title: fields.title ?? '',
        description: fields.description ?? '',
        price: fields.price ?? 0,
        images: fields.images ?? [],
        noCropImages: fields.noCropImages ?? [],
        stock: fields.stock ?? 0,
        active: fields.active !== false,
      };
    })
    .filter((p) => p.active && p.slug && p.images.length > 0);
}

// CDATA deja usar el título/descripción tal cual, sin escapar símbolos uno
// por uno — solo hay que neutralizar un "]]>" si el texto lo trajera.
function cdata(value: string): string {
  return `<![CDATA[${(value || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function feedImageUrl(url: string, noCropImages: string[], size: number): string {
  return noCropImages.includes(url) ? cloudinaryOriginal(url) : cloudinaryFill(url, size);
}

export async function GET() {
  const [products, branding] = await Promise.all([fetchActiveProducts(), getBranding()]);

  const items = products
    .map((p) => {
      const mainImage = feedImageUrl(p.images[0], p.noCropImages, 1200);
      const extraImages = p.images.slice(1, 11).map((url) => feedImageUrl(url, p.noCropImages, 1200));
      const availability = p.stock > 0 ? 'in stock' : 'out of stock';
      const description =
        p.description.trim() ||
        `${p.title} — calzado femenino cómodo y elegante de ${branding.storeName}. Pago contra entrega en toda Colombia.`;

      return [
        '  <item>',
        `    <g:id>${p.id}</g:id>`,
        `    <g:title>${cdata(p.title)}</g:title>`,
        `    <g:description>${cdata(description)}</g:description>`,
        `    <g:link>${SITE_URL}/producto/${p.slug}</g:link>`,
        `    <g:image_link>${mainImage}</g:image_link>`,
        ...extraImages.map((url) => `    <g:additional_image_link>${url}</g:additional_image_link>`),
        `    <g:availability>${availability}</g:availability>`,
        `    <g:price>${Math.round(p.price)} COP</g:price>`,
        `    <g:brand>${cdata(branding.storeName)}</g:brand>`,
        '    <g:condition>new</g:condition>',
        '    <g:google_product_category>Apparel &amp; Accessories &gt; Shoes</g:google_product_category>',
        '  </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    `  <title>${cdata(branding.storeName)}</title>`,
    `  <link>${SITE_URL}</link>`,
    `  <description>${cdata(`Catálogo de productos de ${branding.storeName}`)}</description>`,
    items,
    '</channel>',
    '</rss>',
  ].join('\n');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
