import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlugServer } from '@/lib/productsServer';
import { cloudinaryFill, formatPrice } from '@/lib/utils';
import ProductPageClient from '@/components/product/ProductPageClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlugServer(params.slug);
  if (!product) return {};

  const title = product.title;
  const description =
    product.description?.trim().slice(0, 160) ||
    `${product.title} — ${formatPrice(product.price)}. Pago contra entrega en toda Colombia.`;
  const image = product.images[0] ? cloudinaryFill(product.images[0], 800) : undefined;

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
