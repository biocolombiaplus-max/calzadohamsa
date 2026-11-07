import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlugServer, getRelatedProductsServer } from '@/lib/productsServer';
import { cloudinaryFill, formatPrice, resolveColorImage } from '@/lib/utils';
import ProductPageClient from '@/components/product/ProductPageClient';
import type { Product } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calzadohamsa.com';
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';

// El link que se manda por WhatsApp incluye "?color=X" (ver BuyBox.tsx) para
// que la vista previa que arma WhatsApp muestre la foto del color que la
// clienta eligió, en vez de siempre la primera foto del producto.
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { color?: string };
}): Promise<Metadata> {
  const product = await getProductBySlugServer(params.slug);
  if (!product) return {};

  const title = `${product.title} para Mujer`;
  const description =
    product.description?.trim().slice(0, 150) ||
    `${product.title}, sandalia para mujer — ${formatPrice(product.price)}. Pago contra entrega, envío gratis y cambio de talla sin costo en toda Colombia.`;
  const colorImage = searchParams.color ? resolveColorImage(product, searchParams.color) : undefined;
  const rawImage = colorImage || product.images[0];
  const image = rawImage ? cloudinaryFill(rawImage, 800) : undefined;

  return {
    title,
    description,
    // El color en la URL es solo para la vista previa de WhatsApp — para
    // Google, todas las variantes de color son la misma ficha de producto
    // (si no, cuenta como contenido duplicado y compite contra sí misma).
    alternates: { canonical: `/producto/${params.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  };
}

// Esto es lo que hace que Google pueda mostrar el precio y las estrellas
// directo en el resultado de búsqueda (antes de que la clienta ni
// siquiera entre a la página) — mismo truco que usan las tiendas grandes.
function productJsonLd(product: Product) {
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;
  const reviewCount = product.reviewsCount ?? product.reviews?.length ?? 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description?.trim() || `${product.title}, sandalia para mujer.`,
    image: product.images.map((img) => cloudinaryFill(img, 800)),
    sku: product.id,
    brand: { '@type': 'Brand', name: STORE_NAME },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: 'COP',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(avgRating && reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.round(avgRating * 10) / 10,
            reviewCount,
          },
        }
      : {}),
  };
}

function breadcrumbJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
      { '@type': 'ListItem', position: 3, name: product.title, item: `${SITE_URL}/producto/${product.slug}` },
    ],
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugServer(params.slug);
  if (!product) notFound();
  const relatedProducts = await getRelatedProductsServer(product.id, product.collection);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(product)) }} />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
