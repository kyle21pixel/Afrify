import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Categories from '@/components/home/Categories';
import Benefits from '@/components/home/Benefits';
import Newsletter from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Categories />
      <FeaturedProducts />
      <Benefits />
      <Newsletter />
    </>
  );
}
