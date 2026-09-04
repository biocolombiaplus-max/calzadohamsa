import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import FeaturedProducts from '@/components/FeaturedProducts';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import Testimonials from '@/components/Testimonials';
import HomeCTA from '@/components/HomeCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <HomeCTA />
    </>
  );
}
