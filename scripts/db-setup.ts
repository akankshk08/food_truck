/**
 * Prepares the database: applies migrations, then (only the very first time)
 * creates the starter categories and imports the existing menu from config/brand.ts.
 *
 *   npm run db:setup
 *
 * Safe to run again: migrations are applied once, and the import never repeats,
 * so products you later edit or delete in the admin are left alone.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { menu } from "../config/brand";
import { hashPassword } from "../lib/auth/password";
import { connectionOptions } from "../lib/db/connection";
import * as schema from "../lib/db/schema";
import { slugify } from "../lib/slug";

const STARTER_CATEGORIES = ["Chicken Specials", "Coastal Meals", "Biryani", "Vegetarian", "Other"];
const ORIGINAL_CATEGORY: Record<string, string> = {
  "chicken-sukka": "Chicken Specials",
  "chicken-gravy-kori-rotti": "Coastal Meals",
  "mushroom-biryani": "Biryani",
};
const SEED_FLAG = "seeded_v1";

function findImage(src: string): string | null {
  for (const ext of ["", ".avif", ".webp", ".jpg", ".jpeg", ".png"]) {
    const candidate = src + ext;
    if (/\.(avif|webp|jpe?g|png)$/i.test(candidate) && fs.existsSync(path.join(process.cwd(), "public", candidate))) {
      return candidate;
    }
  }
  return null;
}

async function main() {
  if (process.env.VERCEL && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in Vercel → Settings → Environment Variables. Add your Turso database URL and redeploy.");
  }
  const url = process.env.DATABASE_URL ?? "file:./data/app.db";
  const client = createClient(connectionOptions(url, process.env.DATABASE_AUTH_TOKEN));
  const db = drizzle(client, { schema });

  console.log(`Applying migrations to ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//***@")} …`);
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  await createFirstAdmin(db);

  const seeded = await db.select().from(schema.appMeta).where(eq(schema.appMeta.key, SEED_FLAG));
  if (seeded.length > 0) {
    console.log("Starter data already imported — nothing else to do.");
    client.close();
    return;
  }

  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, number>();
    for (const [i, name] of STARTER_CATEGORIES.entries()) {
      const slug = slugify(name);
      const existing = await tx.select().from(schema.categories).where(eq(schema.categories.slug, slug));
      const id =
        existing[0]?.id ??
        (await tx.insert(schema.categories).values({ name, slug, sortOrder: i }).returning({ id: schema.categories.id }))[0].id;
      categoryIds.set(name, id);
    }

    for (const [i, item] of menu.entries()) {
      const exists = await tx.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.slug, item.id));
      if (exists.length) continue;
      const categoryName = ORIGINAL_CATEGORY[item.id] ?? "Other";
      await tx.insert(schema.products).values({
        name: item.name,
        slug: item.id,
        subtitle: item.localName ?? null,
        shortDescription: item.description,
        description: item.description,
        imageUrl: findImage(item.image.src),
        imageAlt: item.image.alt,
        categoryId: categoryIds.get(categoryName) ?? null,
        isVeg: item.veg,
        spiceLevel: item.spiceLevel ?? 0,
        // The original menu showed a "Signature Speciality" badge; that is now the Featured toggle.
        isFeatured: item.category === "Signature Speciality",
        isAvailable: true,
        isPublished: true,
        sortOrder: i,
      });
      console.log(`Imported "${item.name}" (no portions yet — prices show "Coming Soon" until you add them).`);
    }

    await tx.insert(schema.appMeta).values({ key: SEED_FLAG, value: new Date().toISOString() });
  });

  console.log("Database ready.");
  client.close();
}

/**
 * For browser-only deployments: if no admin exists yet and ADMIN_EMAIL + ADMIN_PASSWORD are set
 * (e.g. in Vercel's environment variables), create that first admin. Never changes an existing admin.
 */
async function createFirstAdmin(db: ReturnType<typeof drizzle<typeof schema>>) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.select({ id: schema.admins.id }).from(schema.admins).limit(1);
  if (existing.length) {
    console.log("An admin already exists — ADMIN_EMAIL/ADMIN_PASSWORD ignored. You can remove them from your settings.");
    return;
  }
  await db.insert(schema.admins).values({ email, passwordHash: await hashPassword(password) });
  console.log(`First admin created for ${email}. Remove ADMIN_PASSWORD from your settings now.`);
}

main().catch((err) => {
  console.error("Database setup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
