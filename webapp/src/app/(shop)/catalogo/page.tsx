import { Suspense } from 'react';
import { getActiveProductsServer } from '@/lib/productsServer';
import CatalogoContent from './CatalogoContent';

export default async function CatalogoPage() {
  const products = await getActiveProductsServer();

  return (
    <Suspense fallback={<div className="container-page py-10 text-center text-muted">Cargando catálogo...</div>}>
      <CatalogoContent initialProducts={products} />
    </Suspense>
  );
}
