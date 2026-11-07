import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getActiveProductsServer } from '@/lib/productsServer';
import CatalogoContent from './CatalogoContent';

export const metadata: Metadata = {
  title: 'Catálogo de Sandalias y Zapatos para Mujer',
  description:
    'Todo el catálogo de sandalias y zapatos de mujer: modelos nuevos cada semana, pago contra entrega, envío gratis y cambio de talla sin costo. Encuentra el calzado ideal para tu outfit.',
  alternates: { canonical: '/catalogo' },
  openGraph: {
    title: 'Catálogo de Sandalias y Zapatos para Mujer',
    description: 'Todo el catálogo de sandalias y zapatos de mujer, con envío gratis y pago contra entrega.',
  },
};

export default async function CatalogoPage() {
  const products = await getActiveProductsServer();

  return (
    <Suspense fallback={<div className="container-page py-10 text-center text-muted">Cargando catálogo...</div>}>
      <CatalogoContent initialProducts={products} />
    </Suspense>
  );
}
