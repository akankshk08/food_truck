import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Database tables for the admin dashboard and the public menu.
 * Timestamps are Unix epoch milliseconds. Prices are whole paise (₹1 = 100 paise).
 */

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
};

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamps.createdAt,
  },
  (t) => [uniqueIndex("categories_slug_unique").on(t.slug), uniqueIndex("categories_name_unique").on(t.name)]
);

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    /** Optional second line under the name, e.g. "Mangalorean dry roast". */
    subtitle: text("subtitle"),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    isVeg: integer("is_veg", { mode: "boolean" }).notNull().default(false),
    spiceLevel: integer("spice_level").notNull().default(0),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_unique").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_public_idx").on(t.isPublished, t.sortOrder),
    check("products_spice_level_check", sql`${t.spiceLevel} BETWEEN 0 AND 3`),
  ]
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("product_images_product_idx").on(t.productId)]
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    portionName: text("portion_name").notNull(),
    /** Amount as text so "1.5" or "250" both work; shown with the unit. */
    quantity: text("quantity"),
    unit: text("unit"),
    pricePaise: integer("price_paise").notNull(),
    description: text("description"),
    isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("product_variants_product_idx").on(t.productId),
    check("product_variants_price_check", sql`${t.pricePaise} > 0`),
  ]
);

export const admins = sqliteTable(
  "admins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    createdAt: timestamps.createdAt,
  },
  (t) => [uniqueIndex("admins_email_unique").on(t.email)]
);

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    /** SHA-256 of the session token; the raw token only lives in the admin's cookie. */
    id: text("id").primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("admin_sessions_admin_idx").on(t.adminId)]
);

/** Counters for login rate limiting (shared across server instances because they live in the DB). */
export const loginAttempts = sqliteTable("login_attempts", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: integer("reset_at", { mode: "timestamp_ms" }).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;

/** Small key/value table for one-time setup flags (e.g. "the original menu has been imported"). */
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
}));
export const variantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));
export const imagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
