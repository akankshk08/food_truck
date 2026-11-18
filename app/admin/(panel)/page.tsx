import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import Link from "next/link";
import { CheckCircle2, EyeOff, Layers, PlusCircle, UtensilsCrossed, XCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/data/products";
import { formatDate } from "@/lib/admin/dates";
import PageHeader from "@/components/admin/PageHeader";
import Thumb from "@/components/admin/Thumb";
import { Badge, Card } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // Checked here as well as in the layout: Next.js renders pages alongside layouts, so each page guards its own data.
  await requireAdminPage();
  const stats = await getDashboardStats();
  const cards = [
    { label: "Total products", value: stats.total, icon: UtensilsCrossed, note: "All dishes, including drafts" },
    { label: "Active products", value: stats.active, icon: CheckCircle2, note: "Published and available" },
    { label: "Unavailable", value: stats.unavailable, icon: XCircle, note: "Shown as sold out" },
    { label: "Portion sizes", value: stats.variants, icon: Layers, note: "Across all dishes" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="An overview of your menu."
        actions={
          <Link href="/admin/products/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest hover:bg-gold-soft">
            <PlusCircle size={18} aria-hidden="true" /> Add product
          </Link>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, note }) => (
          <li key={label} className="rounded-2xl border border-gold/20 bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand/60">{label}</p>
              <Icon size={20} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
            </div>
            <p className="mt-4 font-serif text-5xl text-cream [font-variant-numeric:tabular-nums]">{value}</p>
            <p className="mt-1 text-xs text-sand/50">{note}</p>
          </li>
        ))}
      </ul>

      {stats.drafts > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-sand/70">
          <EyeOff size={16} className="text-gold/80" aria-hidden="true" />
          {stats.drafts} draft{stats.drafts === 1 ? " is" : "s are"} hidden from the website.
        </p>
      )}

      <Card className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl text-cream">Recently added</h2>
          <Link href="/admin/products" className="text-sm text-gold hover:underline">
            All products
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gold/30 p-8 text-center">
            <p className="text-sand/70">No dishes yet.</p>
            <Link href="/admin/products/new" className="mt-3 inline-block text-gold hover:underline">
              Add your first dish
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-bronze/30">
            {stats.recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-4 py-3 hover:text-gold">
                  <Thumb src={p.imageUrl} alt={p.name} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-cream">{p.name}</span>
                    <span className="text-xs text-sand/55">Added {formatDate(p.createdAt)}</span>
                  </span>
                  <span className="hidden gap-2 sm:flex">
                    {p.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="muted">Draft</Badge>}
                    {!p.isAvailable && <Badge tone="red">Unavailable</Badge>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
