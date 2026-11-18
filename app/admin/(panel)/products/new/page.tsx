import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { listCategories } from "@/lib/data/categories";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const categories = await listCategories();
  return (
    <>
      <PageHeader title="Add product" subtitle="Add a dish, its photo, and every portion size with its price." />
      <ProductForm categories={categories.map(({ id, name }) => ({ id, name }))} />
    </>
  );
}
