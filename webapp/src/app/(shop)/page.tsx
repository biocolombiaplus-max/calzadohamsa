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

// Estilo catálogo de moda (Mussi, Michael Kors): lo primero que se ve son
// los diseños, no una foto grande de marca — por eso el Hero (la foto de
// estilo de vida) se movió más abajo, después de los productos, en vez de
// ser el primer bloque. TrustBar es solo una línea delgada de confianza,
// no bloquea la vista de los productos. Luego sigue la prueba de que la
// tienda es real (entregas, reseñas, capturas de WhatsApp), el proceso,
// el valor, las dudas (FAQ) y el llamado final.
export default async function HomePage() {
  const products = await getFeaturedProductsServer(8);

  return (
    <>
      <TrustBar />
      <FeaturedProducts products={products} />
      <Hero />
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
