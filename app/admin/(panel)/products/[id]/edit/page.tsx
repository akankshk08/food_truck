import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import Link from "next/link";
import { Eye } from "lucide-react";
import { listCategories } from "@/lib/data/categories";
import { loadProductOr404 } from "@/lib/admin/load-product";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const [product, categories] = await Promise.all([loadProductOr404((await params).id), listCategories()]);
  return (
    <>
      <PageHeader
        title={`Edit ${product.name}`}
        subtitle="Changes appear on the website as soon as you save."
        actions={
          <Link href={`/admin/products/${product.id}/preview`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/50 px-5 text-sm font-semibold text-gold hover:bg-gold/10">
            <Eye size={18} aria-hidden="true" /> Preview
          </Link>
        }
      />
      <ProductForm
        key={product.updatedAt.getTime()}
        categories={categories.map(({ id, name }) => ({ id, name }))}
        initial={{
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          shortDescription: product.shortDescription,
          description: product.description,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          isVeg: product.isVeg,
          spiceLevel: product.spiceLevel,
          isFeatured: product.isFeatured,
          isAvailable: product.isAvailable,
          isPublished: product.isPublished,
          sortOrder: product.sortOrder,
          variants: product.variants,
        }}
      />
    </>
  );
}
