import { getActiveProductsServer } from '@/lib/productsServer';
import Oferta2x1Client from '@/components/product/Oferta2x1Client';

// El catálogo se trae en el servidor (misma técnica que Inicio, Catálogo y
// Ficha de producto) — así la página nunca se queda en "Cargando
// catálogo..." en una conexión lenta: el HTML ya llega con todo listo.
export default async function Oferta2x1Page() {
  const products = await getActiveProductsServer();
  return <Oferta2x1Client products={products} />;
}
