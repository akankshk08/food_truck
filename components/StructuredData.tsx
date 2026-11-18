import { brand, contact, location } from "@/config/brand";
import { loadPublishedMenu } from "@/lib/data/menu";
import { directionsLink } from "@/lib/links";

/** Business details for search engines (schema.org), including the current published menu. */
export default async function StructuredData() {
  const menu = (await loadPublishedMenu()) ?? [];
  const data = {
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
      hasMenuItem: menu.map((m) => ({ "@type": "MenuItem", name: m.name, description: m.shortDescription })),
    },
  };
  // Escape "<" so text typed in the admin can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
