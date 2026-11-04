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

// El Hero (foto grande a todo el ancho, sin insignias encima para no
// tapar el producto) es lo primero que se ve. Luego, de una vez, las
// sandalias — y solo después la línea de confianza (envío gratis, contra
// entrega, etc.), la prueba de que la tienda es real, el proceso, el
// valor, las dudas (FAQ) y el llamado final.
export default async function HomePage() {
  const products = await getFeaturedProductsServer(8);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <TrustBar />
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
