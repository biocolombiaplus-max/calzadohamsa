// Trae los productos ANTES de renderizar la página (en el servidor), para
// que el HTML que le llega a la visitante ya traiga las sandalias listas
// desde el primer instante — en vez de mostrar la página vacía/con
// "esqueletos" de carga y recién IR A BUSCAR los productos después, cuando
// el navegador ya terminó de cargar el JavaScript. Ese doble viaje (HTML
// vacío → JS → Firestore → ahora sí productos) es la causa más probable de
// que la gente entre y se vaya sin comprar: en una tienda grande (Dafiti,
// Mercado Libre, etc.) la primera foto que ves ya viene en el HTML.
//
// Usa la misma técnica que src/lib/settingsServer.ts y src/lib/branding.ts
// (API REST pública de Firestore) porque el SDK de cliente de Firebase está
// deliberadamente deshabilitado fuera del navegador.
import type { Product } from './types';

function unwrapValue(value: any): any {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return new Date(value.timestampValue).getTime();
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

function toProduct(id: string, data: any): Product {
  return {
    id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    price: data.price ?? 0,
    compareAtPrice: data.compareAtPrice ?? null,
    images: data.images ?? [],
    noCropImages: data.noCropImages ?? [],
    imageScale: data.imageScale ?? {},
    sizes: data.sizes ?? [],
    colors: data.colors ?? [],
    collection: data.collection ?? 'sandalias',
    stock: data.stock ?? 0,
    featured: !!data.featured,
    active: data.active !== false,
    soldCount: data.soldCount ?? 0,
    reviewsCount: data.reviewsCount ?? 0,
    reviews: data.reviews ?? [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// Catálogos de verdad pueden tener más productos de los que Firestore
// devuelve en una sola página — se piden las siguientes hasta traerlos
// todos (igual que /api/product-feed).
async function fetchAllProductDocs(projectId: string): Promise<any[]> {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`;
  const docs: any[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(base);
    url.searchParams.set('pageSize', '200');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url.toString(), { signal: controller.signal, next: { revalidate: 30 } });
    clearTimeout(timeout);
    if (!res.ok) break;
    const data = await res.json();
    docs.push(...(data.documents ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return docs;
}

// Caché en memoria del proceso (además de la caché de "fetch" de Next) para
// que, dentro de la misma solicitud o en solicitudes muy seguidas, no se
// vuelva a golpear la red si ya se acaba de pedir — las tres páginas
// (inicio, catálogo, producto) pueden pedir productos casi al mismo tiempo.
let cache: { at: number; products: Product[] } | null = null;
const CACHE_MS = 30_000;

async function fetchAllProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.products;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return cache?.products ?? [];

  try {
    const docs = await fetchAllProductDocs(projectId);
    const products = docs
      .map((doc: any) => toProduct(doc.name.split('/').pop(), unwrapFields(doc.fields ?? {})))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    cache = { at: Date.now(), products };
    return products;
  } catch {
    // Nunca debe tumbar la página — si falla, se muestra lo que haya en
    // caché (aunque esté vencida) o una lista vacía como último recurso.
    return cache?.products ?? [];
  }
}

export async function getActiveProductsServer(): Promise<Product[]> {
  return (await fetchAllProducts()).filter((p) => p.active);
}

export async function getFeaturedProductsServer(max = 8): Promise<Product[]> {
  const active = await getActiveProductsServer();
  const featured = active.filter((p) => p.featured);
  return (featured.length > 0 ? featured : active).slice(0, max);
}

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  const products = await fetchAllProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
