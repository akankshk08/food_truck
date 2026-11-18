/** The shape of a dish as the public menu card needs it (plain data, safe to send to the browser). */
export type MenuCardPortion = {
  id: number;
  portionName: string;
  quantity: string | null;
  unit: string | null;
  pricePaise: number;
  description: string | null;
  isAvailable: boolean;
};

export type MenuCardProduct = {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  shortDescription: string;
  imageUrl: string | null;
  imageAlt: string | null;
  isVeg: boolean;
  spiceLevel: number;
  isFeatured: boolean;
  isAvailable: boolean;
  variants: MenuCardPortion[];
};

/** Badge text for featured dishes (the original menu's "Signature Speciality" label). */
export const FEATURED_LABEL = "Signature Speciality";
