import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { brand, contact, location, menu } from "@/config/brand";
import { directionsLink } from "@/lib/links";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = `${brand.name} — Coastal Karnataka Food Truck in Bangalore`;
const description =
  "Authentic coastal Karnataka and Mangalorean street food in Bangalore. Chicken Sukka, Kori Rotti, Mushroom Biryani and more — freshly prepared from our food truck. Order on WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: { default: title, template: `%s | ${brand.name}` },
  description,
  applicationName: brand.name,
  keywords: [
    "Mangalorean food Bangalore",
    "coastal Karnataka food",
    "food truck Bangalore",
    "Chicken Sukka",
    "Kori Rotti",
    "Mushroom Biryani",
    "Mangalorean street food",
    "Udupi Mangalore cuisine",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: brand.name,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  category: "food",
};

export const viewport: Viewport = {
  themeColor: "#101B12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: brand.name,
  description: brand.description,
  url: brand.siteUrl,
  servesCuisine: ["Mangalorean", "Coastal Karnataka", "South Indian"],
  hasMap: directionsLink(),
  address: {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressRegion: location.region,
    addressCountry: "IN",
  },
  ...(contact.phone ? { telephone: contact.phone } : {}),
  ...(contact.instagramUrl ? { sameAs: [contact.instagramUrl] } : {}),
  hasMenu: {
    "@type": "Menu",
    hasMenuItem: menu.map((m) => ({ "@type": "MenuItem", name: m.name, description: m.description })),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
