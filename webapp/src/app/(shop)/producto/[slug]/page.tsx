import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlugServer } from '@/lib/productsServer';
import { cloudinaryFill, formatPrice, resolveColorImage } from '@/lib/utils';
import ProductPageClient from '@/components/product/ProductPageClient';

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

  const title = product.title;
  const description =
    product.description?.trim().slice(0, 160) ||
    `${product.title} — ${formatPrice(product.price)}. Pago contra entrega en toda Colombia.`;
  const colorImage = searchParams.color ? resolveColorImage(product, searchParams.color) : undefined;
  const rawImage = colorImage || product.images[0];
  const image = rawImage ? cloudinaryFill(rawImage, 800) : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: image ? [image] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugServer(params.slug);
  if (!product) notFound();

  return <ProductPageClient product={product} />;
}
