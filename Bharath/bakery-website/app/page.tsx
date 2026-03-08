import { HeroSection } from "@/modules/landing/hero";
import { FeaturedProductsSection } from "@/modules/landing/featured-products";
import { AboutSection } from "@/modules/landing/about";
import { ContactSection } from "@/components/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProductsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
