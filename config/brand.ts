/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Everything a non-developer may need to change lives here:
 *  brand name, contact details, location, hours, menu and photos.
 *  Components read from this file — no need to edit them.
 * ─────────────────────────────────────────────────────────────
 */

/* ── Brand ─────────────────────────────────────────────────── */

export const brand = {
  /** Temporary name. Change it here and it updates everywhere (nav, footer, SEO, share cards). */
  name: "YOUR COASTAL KITCHEN",
  /** Shorter form used in tight spaces (mobile nav, browser tab). */
  shortName: "Coastal Kitchen",
  tagline: "A Little Taste of the Coast.",
  description:
    "Authentic coastal Karnataka and Mangalorean-style food, freshly prepared and served from our food truck on the streets of Bangalore.",
  /** Public site URL, used for SEO and social share links. Set NEXT_PUBLIC_SITE_URL when you deploy. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  foundedYear: 2026,
} as const;

/* ── Contact ───────────────────────────────────────────────── */

export const contact = {
  /**
   * WhatsApp number in international format, digits only, no "+" or spaces.
   * Example: "919876543210" (91 = India). Leave empty until the number is final —
   * WhatsApp will still open with the message pre-filled and let the customer pick a chat.
   */
  whatsappNumber: "",
  whatsappMessage: "Hello! I would like to know more about your menu and today's availability.",

  /** Phone number for click-to-call, in international format, e.g. "+919876543210". Leave empty to show a placeholder. */
  phone: "",
  /** How the number is shown on the site, e.g. "+91 98765 43210". */
  phoneDisplay: "",

  /** Instagram profile URL and handle. Leave empty to show a placeholder. */
  instagramUrl: "",
  instagramHandle: "",

  email: "",
} as const;

/* ── Location ──────────────────────────────────────────────── */

export const location = {
  city: "Bangalore",
  region: "Karnataka",
  country: "India",
  /**
   * Name of the operating spot once finalised, e.g. "Opposite XYZ Park, Indiranagar".
   * Leave empty to show "Exact spot announced soon".
   */
  spotName: "",
  /**
   * What Google Maps should search for. Use the full address once known.
   * For a precise pin, fill in `coordinates` instead.
   */
  mapsQuery: "Bangalore, Karnataka, India",
  coordinates: null as { lat: number; lng: number } | null,
  /** Map zoom level: ~11 for the whole city, ~16 for a street. */
  mapZoom: 11,
};

/** Opening hours. Replace "To be announced" with real times, e.g. "6:00 PM – 11:00 PM". */
export const hours: { days: string; time: string }[] = [
  { days: "Monday – Friday", time: "To be announced" },
  { days: "Saturday – Sunday", time: "To be announced" },
];

/* ── Menu ──────────────────────────────────────────────────── */

export type MenuItem = {
  id: string;
  name: string;
  /** Optional local-language name shown under the dish name. */
  localName?: string;
  category?: string;
  description: string;
  /** Use a number (e.g. 180) once prices are final. Until then a string such as "Coming Soon" is shown. */
  price: number | string;
  veg: boolean;
  spiceLevel?: 1 | 2 | 3;
  image: SiteImage;
};

/**
 * Photos: put files in /public/images. `src` is given WITHOUT an extension —
 * the site looks for .avif, .webp, .jpg, .jpeg or .png automatically.
 * If no file is found, an elegant placeholder is shown instead.
 * `brief` describes the shot so a photographer knows exactly what to capture.
 */
export type SiteImage = {
  src: string;
  alt: string;
  brief: string;
  /**
   * Credit for photos used under a free licence (e.g. from Wikimedia Commons).
   * Shown in the footer. Remove it when you replace the photo with your own.
   */
  credit?: PhotoCredit;
};

export type PhotoCredit = {
  author: string;
  license: string;
  /** Link to the photo's source page. */
  url: string;
};

export const currency = "₹";

export const menu: MenuItem[] = [
  {
    id: "chicken-sukka",
    name: "Chicken Sukka",
    localName: "Mangalorean dry roast",
    category: "Signature Speciality",
    description:
      "Traditional coastal-style chicken cooked with aromatic roasted spices, coconut and curry leaves. Rich, spicy and packed with authentic Mangalorean flavours.",
    price: "Coming Soon",
    veg: false,
    spiceLevel: 3,
    image: {
      src: "/images/chicken-sukka",
      alt: "Mangalorean dry Chicken Sukka — bite-sized chicken in a dark roasted masala with curry leaves, served in a brass bowl on a banana leaf",
      brief:
        "Dry, semi-dry sukka: bite-sized chicken, thick dark reddish-brown roasted masala, visible roasted grated coconut, curry leaves, caramelised onions, very little gravy. Brass bowl or banana-leaf-lined plate.",
    },
  },
  {
    id: "chicken-gravy-kori-rotti",
    name: "Chicken Gravy with Kori Rotti",
    localName: "Kori Rotti",
    description:
      "Traditional crispy kori rotti paired with rich, flavourful coastal chicken gravy prepared with authentic Mangalorean spices.",
    price: "Coming Soon",
    veg: false,
    spiceLevel: 2,
    image: {
      src: "/images/kori-rotti",
      alt: "Crisp, paper-thin kori rotti beside a bowl of rich coastal chicken gravy",
      brief:
        "Brass bowl of rich reddish-brown coastal chicken gravy, with separate crisp, thin kori rotti wafers alongside. Banana-leaf presentation.",
    },
  },
  {
    id: "mushroom-biryani",
    name: "Mushroom Biryani",
    description:
      "Aromatic basmati rice cooked with fresh mushrooms, fragrant spices and a delicious blend of herbs.",
    price: "Coming Soon",
    veg: true,
    spiceLevel: 1,
    image: {
      src: "/images/mushroom-biryani",
      alt: "Mushroom biryani in a copper handi — long-grain basmati with mushrooms, fried onions and herbs, on a banana leaf",
      brief:
        "Mushroom biryani in a brass handi: visible mushroom pieces, long-grain basmati, fried onions, coriander and mint on top.",
    },
  },
];

/* ── Other photography ─────────────────────────────────────── */

export const images = {
  hero: {
    src: "/images/hero-food-truck",
    alt: "Our dark-green food truck at night, glowing with warm golden light beneath palm trees",
    brief:
      "Wide landscape shot: dark-green food truck at night, warm golden lighting, palm trees / tropical foliage. Leave dark space on the left for the headline.",
  },
  storyMain: {
    src: "/images/story-cooking",
    alt: "Chicken sukka steaming in an iron kadai, coated in roasted masala with coconut and curry leaves",
    brief: "Portrait: hands roasting masala in an iron kadai over flame, steam and warm light.",
  },
  storySpices: {
    src: "/images/story-spices",
    alt: "Dried red chillies, coriander seeds, black peppercorns and cumin in a stone bowl",
    brief: "Overhead: Byadgi chillies, coriander, pepper, cumin and fresh grated coconut on stone or brass.",
  },
  storyCoconut: {
    src: "/images/story-coconut",
    alt: "Freshly grated coconut beside a halved coconut on a banana leaf",
    brief: "Close-up: freshly grated coconut and curry leaves next to a traditional grinding stone.",
  },
} satisfies Record<string, SiteImage>;

/* ── Navigation ────────────────────────────────────────────── */

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Our Story", href: "#story" },
  { label: "Menu", href: "#menu" },
  { label: "Find Us", href: "#find-us" },
] as const;
