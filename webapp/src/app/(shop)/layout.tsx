import SiteChrome from '@/components/SiteChrome';

// Las páginas de la tienda dependen de datos en vivo de Firestore (productos,
// carrito, pedidos), así que se renderizan siempre en el momento de la
// solicitud en lugar de generarse como HTML estático en el build.
export const dynamic = 'force-dynamic';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
