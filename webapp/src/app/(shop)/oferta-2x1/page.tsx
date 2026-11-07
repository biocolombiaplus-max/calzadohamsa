import type { Metadata } from 'next';
import { getActiveProductsServer } from '@/lib/productsServer';
import Oferta2x1Client from '@/components/product/Oferta2x1Client';

export const metadata: Metadata = {
  title: 'Oferta 2×1 en Sandalias — Envío Gratis',
  description:
    'Lleva 2 pares de sandalias para mujer por un solo precio, con envío gratis a toda Colombia. Pago contra entrega y cambio de talla sin costo. Aprovecha la oferta 2×1 de Hamsa Shoes.',
  alternates: { canonical: '/oferta-2x1' },
  openGraph: {
    title: 'Oferta 2×1 en Sandalias — Envío Gratis',
    description: 'Lleva 2 pares de sandalias por un solo precio, con envío gratis a toda Colombia.',
  },
};

// El catálogo se trae en el servidor (misma técnica que Inicio, Catálogo y
// Ficha de producto) — así la página nunca se queda en "Cargando
// catálogo..." en una conexión lenta: el HTML ya llega con todo listo.
export default async function Oferta2x1Page() {
  const products = await getActiveProductsServer();
  return <Oferta2x1Client products={products} />;
}
