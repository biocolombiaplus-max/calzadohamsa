import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import FeaturedProducts from '@/components/FeaturedProducts';
import RealDeliveries from '@/components/RealDeliveries';
import Testimonials from '@/components/Testimonials';
import ChatProofs from '@/components/ChatProofs';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import FAQ from '@/components/FAQ';
import HomeCTA from '@/components/HomeCTA';
import { getFeaturedProductsServer } from '@/lib/productsServer';

// Orden pensado como el de una marca grande: primero el producto (es lo
// que la trajo desde el anuncio), LUEGO la prueba de que es real —fotos de
// entregas, reseñas, capturas de WhatsApp— justo ahí, antes de que la duda
// la haga irse. Después se explica el proceso, se refuerza el valor, se
// resuelven las últimas dudas (FAQ) y se cierra con el llamado final.
export default async function HomePage() {
  const products = await getFeaturedProductsServer(8);

  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedProducts products={products} />
      <RealDeliveries />
      <Testimonials />
      <ChatProofs />
      <HowItWorks />
      <Benefits />
      <FAQ />
      <HomeCTA />
    </>
  );
}
