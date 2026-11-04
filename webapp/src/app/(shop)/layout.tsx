import SiteChrome from '@/components/SiteChrome';
import { getSiteSettingsServer } from '@/lib/settingsServer';
import { googleFontsHref } from '@/lib/fonts';

// ¡OJO! No pongas aquí "export const dynamic = 'force-dynamic'". Eso
// obliga a CADA visita (homepage, catálogo, fichas de producto) a esperar
// un viaje en vivo a Firestore antes de poder mostrar nada — incluso
// aunque getSiteSettingsServer() y getActiveProductsServer()/etc. ya
// piden que su resultado se cachee por 30-60s (ver "next: { revalidate }"
// en esos archivos): "force-dynamic" en el layout anula ese cacheo para
// TODA la tienda sin avisar. Eso es justo el "cuello de botella post-clic"
// que detectó Meta Ads (CTR sano, pero muchos clics que nunca llegan a
// contarse como visita — la página tarda en responder antes de que
// alcance a cargar ni el píxel). Quitar esto deja que Vercel sirva la
// mayoría de las visitas desde caché casi al instante y solo pida datos
// frescos a Firestore cada 30-60s en segundo plano. Las páginas que sí
// necesitan datos en vivo por pedido (checkout, el pedido ya creado, el
// panel admin) los piden ellas mismas — no hace falta forzarlo acá.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettingsServer();

  return (
    <>
      {/* El logo, la foto del hero y la tipografía ya llegan resueltos en
          este mismo HTML — así el navegador empieza a descargarlos de una
          vez, sin esperar a un viaje extra a la base de datos desde el
          cliente antes de saber qué imagen mostrar. "Great Vibes" es fija
          (no depende de lo que el admin elija en Configuración) — es la
          fuente script del título del Hero, ver Hero.tsx. */}
      <link rel="stylesheet" href={googleFontsHref([settings.fonts.headingFont, settings.fonts.bodyFont, 'Great Vibes'])} />
      <SiteChrome initialSettings={settings}>{children}</SiteChrome>
    </>
  );
}
