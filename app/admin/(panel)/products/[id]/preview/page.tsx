import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { loadProductOr404 } from "@/lib/admin/load-product";
import MenuCard from "@/components/MenuCard";
import PageHeader from "@/components/admin/PageHeader";
import { Badge, Card } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Preview" };

/** Shows the dish exactly as the website's menu card renders it (even drafts), plus its extra details. */
export default async function PreviewProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const p = await loadProductOr404((await params).id);
  const card = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    shortDescription: p.shortDescription,
    imageUrl: p.imageUrl,
    imageAlt: p.imageAlt,
    isVeg: p.isVeg,
    spiceLevel: p.spiceLevel,
    isFeatured: p.isFeatured,
    isAvailable: p.isAvailable,
    variants: p.variants,
  };

  return (
    <>
      <PageHeader
        title="Preview"
        subtitle="This is how the dish looks on your website's menu."
        actions={
          <Link href={`/admin/products/${p.id}/edit`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-forest hover:bg-gold-soft">
            <Pencil size={16} aria-hidden="true" /> Edit
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {p.isPublished ? <Badge tone="green">Published — visible on the website</Badge> : <Badge tone="muted">Draft — hidden from the website</Badge>}
        {!p.isAvailable && <Badge tone="red">Unavailable</Badge>}
        {p.category && <Badge tone="gold">{p.category.name}</Badge>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="bg-forest-2 p-1">
          <MenuCard item={card} image={{ src: p.imageUrl ?? "", alt: p.imageAlt || p.name, brief: "", file: p.imageUrl }} index={0} />
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="font-serif text-2xl text-cream">Full description</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-sand/80">{p.description || <span className="text-sand/45">No full description yet.</span>}</p>
          </Card>
          {p.images.length > 0 && (
            <Card>
              <h2 className="font-serif text-2xl text-cream">Extra photos</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.images.map((img) => (
                  <li key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-gold/20">
                    <Image src={img.url} alt={img.alt || p.name} fill sizes="200px" className="object-cover" />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
