import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { ProductListQuery } from "@/lib/admin/schemas";
import { listCategories } from "@/lib/data/categories";
import { listProductsForAdmin } from "@/lib/data/products";
import PageHeader from "@/components/admin/PageHeader";
import ProductTable from "@/components/admin/ProductTable";
import { inputClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const raw = await searchParams;
  const parsed = ProductListQuery.safeParse({ q: raw.q, category: raw.category || undefined, page: raw.page || undefined });
  const query = parsed.success ? parsed.data : { q: "", category: undefined, page: 1 };
  const [cats, result] = await Promise.all([
    listCategories(),
    listProductsForAdmin({ q: query.q, categoryId: query.category, page: query.page }),
  ]);
  const filtered = !!query.q || !!query.category;

  const pageHref = (page: number) => {
    const sp = new URLSearchParams();
    if (query.q) sp.set("q", query.q);
    if (query.category) sp.set("category", String(query.category));
    sp.set("page", String(page));
    return `/admin/products?${sp}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Everything on your menu. Changes appear on the website as soon as you save."
        actions={
          <Link href="/admin/products/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest hover:bg-gold-soft">
            <PlusCircle size={18} aria-hidden="true" /> Add product
          </Link>
        }
      />

      <form role="search" className="mb-6 grid gap-3 sm:grid-cols-[1fr_14rem_auto]" action="/admin/products">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sand/45" aria-hidden="true" />
          <input id="q" name="q" type="search" defaultValue={query.q} placeholder="Search by dish name" className={`${inputClass} appearance-none pl-11`} />
        </div>
        <label htmlFor="category" className="sr-only">
          Filter by category
        </label>
        <select id="category" name="category" defaultValue={query.category ?? ""} className={inputClass}>
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="min-h-11 rounded-full border border-gold/50 px-5 text-sm font-semibold text-gold hover:bg-gold/10">
            Search
          </button>
          {filtered && (
            <Link href="/admin/products" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-sand/70 hover:text-cream">
              Clear
            </Link>
          )}
        </div>
      </form>

      <ProductTable rows={result.rows} filtered={filtered} />

      {result.pageCount > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm text-sand/70">
          {query.page > 1 ? <Link href={pageHref(query.page - 1)} className="text-gold hover:underline">← Previous</Link> : <span />}
          <span>
            Page {query.page} of {result.pageCount} · {result.total} dishes
          </span>
          {query.page < result.pageCount ? <Link href={pageHref(query.page + 1)} className="text-gold hover:underline">Next →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
