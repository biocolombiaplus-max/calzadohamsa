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

// El Hero ahora es una foto grande a todo el ancho con tipografía
// superpuesta (estilo Maraldo/marcas de ropa premium) y vuelve a ser lo
// primero que se ve, como pidió la clienta. Debajo sigue TrustBar (línea
// delgada de confianza), los productos destacados, la prueba de que la
// tienda es real (entregas, reseñas, capturas de WhatsApp), el proceso,
// el valor, las dudas (FAQ) y el llamado final.
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
