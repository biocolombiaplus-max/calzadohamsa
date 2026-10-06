import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import FeaturedProducts from '@/components/FeaturedProducts';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import Testimonials from '@/components/Testimonials';
import HomeCTA from '@/components/HomeCTA';
import { getFeaturedProductsServer } from '@/lib/productsServer';

export default async function HomePage() {
  const products = await getFeaturedProductsServer(8);

  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedProducts products={products} />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <HomeCTA />
    </>
  );
}
