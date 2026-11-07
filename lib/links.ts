import { contact, location } from "@/config/brand";

/** WhatsApp link with the order message pre-filled. Works even before a number is configured. */
export function whatsappLink(message: string = contact.whatsappMessage): string {
  const text = encodeURIComponent(message);
  const number = contact.whatsappNumber.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** tel: link for click-to-call, or null while no number is configured. */
export function phoneLink(): string | null {
  const number = contact.phone.replace(/[^\d+]/g, "");
  return number ? `tel:${number}` : null;
}

export function instagramLink(): string {
  return contact.instagramUrl || "https://www.instagram.com/";
}

function mapsTarget(): string {
  const c = location.coordinates;
  return c ? `${c.lat},${c.lng}` : location.mapsQuery;
}

/** Opens Google Maps turn-by-turn directions to the truck. */
export function directionsLink(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsTarget())}`;
}

/** Embeddable Google Map (no API key required). */
export function mapEmbedUrl(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapsTarget())}&z=${location.mapZoom}&output=embed`;
}

export function formatPrice(price: number | string, currency: string): string {
  return typeof price === "number" ? `${currency}${price}` : price;
}
