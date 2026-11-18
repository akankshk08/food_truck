import "server-only";
import { asc, eq, max, ne, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";
import { countProductsInCategories } from "./products";

export async function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)).limit(200);
}

export async function listCategoriesWithCounts() {
  const rows = await listCategories();
  const counts = await countProductsInCategories(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, productCount: counts.get(r.id) ?? 0 }));
}

async function nameTaken(name: string, excludeId?: number) {
  const slug = slugify(name);
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(excludeId ? and(eq(categories.slug, slug), ne(categories.id, excludeId)) : eq(categories.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export type CategoryResult = { ok: true; id: number } | { ok: false; reason: "duplicate" | "not_found" | "in_use"; count?: number };

export async function createCategory(name: string): Promise<CategoryResult> {
  if (await nameTaken(name)) return { ok: false, reason: "duplicate" };
  const [{ next }] = await db.select({ next: max(categories.sortOrder) }).from(categories);
  const [row] = await db
    .insert(categories)
    .values({ name, slug: slugify(name), sortOrder: (next ?? 0) + 1 })
    .returning({ id: categories.id });
  return { ok: true, id: row.id };
}

export async function renameCategory(id: number, name: string): Promise<CategoryResult> {
  if (await nameTaken(name, id)) return { ok: false, reason: "duplicate" };
  const rows = await db.update(categories).set({ name, slug: slugify(name) }).where(eq(categories.id, id)).returning({ id: categories.id });
  return rows.length ? { ok: true, id } : { ok: false, reason: "not_found" };
}

/** Refuses to delete a category that still has dishes, so nothing is silently re-filed. */
export async function deleteCategory(id: number): Promise<CategoryResult> {
  const inUse = (await countProductsInCategories([id])).get(id) ?? 0;
  if (inUse > 0) return { ok: false, reason: "in_use", count: inUse };
  const rows = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
  return rows.length ? { ok: true, id } : { ok: false, reason: "not_found" };
}
