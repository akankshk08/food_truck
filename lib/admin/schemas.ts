import { z } from "zod";

/**
 * Validation rules shared by the admin forms (for instant feedback) and the
 * server (which always re-checks). `.strict()` rejects unexpected fields.
 */

export const UNITS = ["g", "kg", "ml", "L", "pcs", "plate", "serves"] as const;
export const MAX_PRICE_PAISE = 1_00_000 * 100; // ₹1,00,000

const BLOB_HOST = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i;

/** Only photos the site itself hosts: bundled site photos, local uploads, or Vercel Blob uploads. */
export function isAllowedImageUrl(url: string): boolean {
  if (/^\/(images|media)\/[A-Za-z0-9._-]+\.(jpe?g|png|webp|avif)$/i.test(url)) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && BLOB_HOST.test(u.hostname);
  } catch {
    return false;
  }
}

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} can be at most ${max} characters.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const imageUrl = z.string().trim().refine(isAllowedImageUrl, "Please upload the photo again.");

export const VariantInput = z
  .object({
    portionName: z.string().trim().min(1, "Give this portion a name, e.g. Small.").max(60, "Portion name is too long."),
    quantity: z
      .string()
      .trim()
      .regex(/^$|^\d{1,6}(\.\d{1,2})?$/, "Quantity must be a number, e.g. 250 or 1.5.")
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    unit: z.enum(UNITS).nullable().optional().transform((v) => v ?? null),
    pricePaise: z
      .number({ error: "Enter a price." })
      .int("Price can have at most 2 decimal places.")
      .min(100, "Price must be at least ₹1.")
      .max(MAX_PRICE_PAISE, "Price looks too high — please check it."),
    description: optionalText(200, "Portion note"),
    isAvailable: z.boolean(),
  })
  .strict();

export const ProductInput = z
  .object({
    name: z.string().trim().min(2, "Enter the dish name.").max(80, "Dish name can be at most 80 characters."),
    subtitle: optionalText(80, "Subtitle"),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Write a short description (at least 10 characters).")
      .max(300, "Short description can be at most 300 characters."),
    description: z.string().trim().max(4000, "Full description can be at most 4000 characters.").default(""),
    categoryId: z.number().int().positive().nullable(),
    imageUrl: imageUrl.nullable(),
    imageAlt: optionalText(200, "Photo description"),
    additionalImages: z.array(z.object({ url: imageUrl, alt: optionalText(200, "Photo description") }).strict()).max(8, "You can add up to 8 extra photos."),
    isVeg: z.boolean(),
    spiceLevel: z.number().int().min(0).max(3),
    isFeatured: z.boolean(),
    isAvailable: z.boolean(),
    isPublished: z.boolean(),
    sortOrder: z.number().int().min(0).max(9999),
    variants: z.array(VariantInput).max(50, "That's a lot of portions — at most 50 per dish."),
  })
  .strict();

export type ProductInputType = z.infer<typeof ProductInput>;
export type VariantInputType = z.infer<typeof VariantInput>;

export const ProductFlagsInput = z
  .object({ isAvailable: z.boolean().optional(), isPublished: z.boolean().optional() })
  .strict()
  .refine((v) => v.isAvailable !== undefined || v.isPublished !== undefined, "Nothing to change.");

export const CategoryInput = z
  .object({ name: z.string().trim().min(2, "Category name is too short.").max(40, "Category name can be at most 40 characters.") })
  .strict();

export const LoginInput = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
    password: z.string().min(1, "Enter your password.").max(128),
  })
  .strict();

export const ProductListQuery = z.object({
  q: z.string().trim().max(80).optional().default(""),
  category: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
});

/** "180" or "180.50" → 18000 / 18050 paise; null when not a valid amount. */
export function rupeesToPaise(input: string): number | null {
  const v = input.trim().replace(/,/g, "");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(v)) return null;
  const [whole, frac = ""] = v.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

export function paiseToRupeesInput(paise: number): string {
  return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}
