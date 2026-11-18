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
import StructuredData from "@/components/StructuredData";

// The menu comes from the database, so render on each request to always show the latest changes.
export const dynamic = "force-dynamic";

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
      <StructuredData />
    </>
  );
}
