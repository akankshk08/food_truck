import "server-only";
import { and, asc, count, desc, eq, inArray, like, min, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, productImages, products, productVariants } from "@/lib/db/schema";
import type { ProductInputType } from "@/lib/admin/schemas";
import { slugify } from "@/lib/slug";

/* ── Public menu ───────────────────────────────────────────── */

export type MenuProduct = Awaited<ReturnType<typeof getPublishedMenu>>[number];

/** Published dishes with their portions, in menu order. One query (no per-dish lookups). */
export async function getPublishedMenu() {
  return db.query.products.findMany({
    where: eq(products.isPublished, true),
    orderBy: [asc(products.sortOrder), asc(products.id)],
    limit: 100,
    columns: {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      shortDescription: true,
      imageUrl: true,
      imageAlt: true,
      isVeg: true,
      spiceLevel: true,
      isFeatured: true,
      isAvailable: true,
    },
    with: {
      variants: {
        orderBy: [asc(productVariants.sortOrder), asc(productVariants.id)],
        columns: { id: true, portionName: true, quantity: true, unit: true, pricePaise: true, description: true, isAvailable: true },
      },
    },
  });
}

/* ── Admin ─────────────────────────────────────────────────── */

export const PAGE_SIZE = 25;

function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listProductsForAdmin(opts: { q: string; categoryId?: number; page: number }) {
  const filters: SQL[] = [];
  if (opts.q) filters.push(sql`${products.name} LIKE ${`%${escapeLike(opts.q)}%`} ESCAPE '\\'`);
  if (opts.categoryId) filters.push(eq(products.categoryId, opts.categoryId));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        imageAlt: products.imageAlt,
        categoryName: categories.name,
        isAvailable: products.isAvailable,
        isPublished: products.isPublished,
        isFeatured: products.isFeatured,
        updatedAt: products.updatedAt,
        portionCount: count(productVariants.id),
        startingPricePaise: min(productVariants.pricePaise),
      })
      .from(products)
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(where)
      .groupBy(products.id)
      .orderBy(desc(products.updatedAt), desc(products.id))
      .limit(PAGE_SIZE)
      .offset((opts.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { rows, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getProductForAdmin(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.sortOrder), asc(productVariants.id)] },
      images: { orderBy: [asc(productImages.sortOrder), asc(productImages.id)] },
    },
  });
}

export async function getDashboardStats() {
  const [[totals], [{ variants }], recent] = await Promise.all([
    db
      .select({
        total: count(),
        active: sql<number>`coalesce(sum(case when ${products.isPublished} = 1 and ${products.isAvailable} = 1 then 1 else 0 end), 0)`,
        unavailable: sql<number>`coalesce(sum(case when ${products.isAvailable} = 0 then 1 else 0 end), 0)`,
        drafts: sql<number>`coalesce(sum(case when ${products.isPublished} = 0 then 1 else 0 end), 0)`,
      })
      .from(products),
    db.select({ variants: count() }).from(productVariants),
    db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        isPublished: products.isPublished,
        isAvailable: products.isAvailable,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt), desc(products.id))
      .limit(5),
  ]);
  return { ...totals, variants, recent };
}

async function uniqueSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name);
  const taken = new Set(
    (await db.select({ slug: products.slug, id: products.id }).from(products).where(like(products.slug, `${base}%`)))
      .filter((r) => r.id !== excludeId)
      .map((r) => r.slug)
  );
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

function productValues(input: ProductInputType) {
  return {
    name: input.name,
    subtitle: input.subtitle,
    shortDescription: input.shortDescription,
    description: input.description,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    categoryId: input.categoryId,
    isVeg: input.isVeg,
    spiceLevel: input.spiceLevel,
    isFeatured: input.isFeatured,
    isAvailable: input.isAvailable,
    isPublished: input.isPublished,
    sortOrder: input.sortOrder,
  };
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function writeChildren(tx: Tx, productId: number, input: ProductInputType) {
  await tx.delete(productVariants).where(eq(productVariants.productId, productId));
  await tx.delete(productImages).where(eq(productImages.productId, productId));
  if (input.variants.length) {
    await tx.insert(productVariants).values(input.variants.map((v, i) => ({ ...v, productId, sortOrder: i })));
  }
  if (input.additionalImages.length) {
    await tx.insert(productImages).values(input.additionalImages.map((img, i) => ({ ...img, productId, sortOrder: i })));
  }
}

async function assertCategoryExists(categoryId: number | null) {
  if (categoryId === null) return true;
  const found = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  return found.length > 0;
}

export { assertCategoryExists };

export async function createProduct(input: ProductInputType): Promise<number> {
  const slug = await uniqueSlug(input.name);
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(products).values({ ...productValues(input), slug }).returning({ id: products.id });
    await writeChildren(tx, row.id, input);
    return row.id;
  });
}

/** Saves all changes at once. Returns photo URLs that are no longer used (to delete), or null if not found. */
export async function updateProduct(id: number, input: ProductInputType): Promise<string[] | null> {
  const before = await getProductForAdmin(id);
  if (!before) return null;
  await db.transaction(async (tx) => {
    await tx.update(products).set({ ...productValues(input), updatedAt: new Date() }).where(eq(products.id, id));
    await writeChildren(tx, id, input);
  });
  const keep = new Set([input.imageUrl, ...input.additionalImages.map((i) => i.url)]);
  return [before.imageUrl, ...before.images.map((i) => i.url)].filter((u): u is string => !!u && !keep.has(u));
}

export async function setProductFlags(id: number, flags: { isAvailable?: boolean; isPublished?: boolean }) {
  const updated = await db
    .update(products)
    .set({ ...flags, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning({ id: products.id, isAvailable: products.isAvailable, isPublished: products.isPublished });
  return updated[0] ?? null;
}

/** Deletes the dish (portions and extra photos go with it). Returns its photo URLs, or null if not found. */
export async function deleteProduct(id: number): Promise<string[] | null> {
  const before = await getProductForAdmin(id);
  if (!before) return null;
  await db.delete(products).where(eq(products.id, id));
  return [before.imageUrl, ...before.images.map((i) => i.url)].filter((u): u is string => !!u);
}

export async function countProductsInCategories(ids: number[]) {
  if (!ids.length) return new Map<number, number>();
  const rows = await db
    .select({ categoryId: products.categoryId, n: count() })
    .from(products)
    .where(inArray(products.categoryId, ids))
    .groupBy(products.categoryId);
  return new Map(rows.map((r) => [r.categoryId as number, r.n]));
}
