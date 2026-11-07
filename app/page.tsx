import { images } from "@/config/brand";
import { resolveImage } from "@/lib/images";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import OurStory from "@/components/OurStory";
import WhyChooseUs from "@/components/WhyChooseUs";
import FindUs from "@/components/FindUs";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero image={resolveImage(images.hero)} />
        <MenuSection />
        <OurStory />
        <WhyChooseUs />
        <FindUs />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
