import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { listCategoriesWithCounts } from "@/lib/data/categories";
import PageHeader from "@/components/admin/PageHeader";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const categories = await listCategoriesWithCounts();
  return (
    <>
      <PageHeader title="Categories" subtitle="Group your dishes. A category can only be deleted once no dishes use it." />
      <CategoryManager categories={categories.map(({ id, name, productCount }) => ({ id, name, productCount }))} />
    </>
  );
}
