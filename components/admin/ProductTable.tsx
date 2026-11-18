"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import { formatDateTime } from "@/lib/admin/dates";
import { formatPaise } from "@/lib/format";
import Thumb from "./Thumb";
import { Badge, ConfirmDialog, Toggle, useToast } from "./ui";

export type ProductRow = {
  id: number;
  name: string;
  imageUrl: string | null;
  imageAlt: string | null;
  categoryName: string | null;
  isAvailable: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  updatedAt: Date;
  portionCount: number;
  startingPricePaise: number | null;
};

export default function ProductTable({ rows, filtered }: { rows: ProductRow[]; filtered: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function toggle(row: ProductRow, flag: "isAvailable" | "isPublished", value: boolean) {
    setBusyId(row.id);
    try {
      await adminFetch(`/api/admin/products/${row.id}`, { method: "PATCH", json: { [flag]: value } });
      toast(
        "success",
        flag === "isAvailable"
          ? `${row.name} is now ${value ? "available" : "marked unavailable"}.`
          : `${row.name} is now ${value ? "published on the website" : "hidden from the website"}.`
      );
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Couldn't update. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
      toast("success", `${toDelete.name} was deleted.`);
      setToDelete(null);
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Couldn't delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/30 bg-card/40 p-10 text-center">
        <p className="font-serif text-2xl text-cream">{filtered ? "No dishes match your search" : "Your menu is empty"}</p>
        <p className="mt-2 text-sand/65">{filtered ? "Try a different name or category." : "Add your first dish to see it here and on the website."}</p>
        {!filtered && (
          <Link href="/admin/products/new" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-forest">
            Add your first dish
          </Link>
        )}
      </div>
    );
  }

  const price = (r: ProductRow) => (r.startingPricePaise ? `From ${formatPaise(r.startingPricePaise)}` : "No price yet");
  const actions = (r: ProductRow) => (
    <div className="flex items-center gap-1">
      <Link href={`/admin/products/${r.id}/edit`} className="rounded-full p-2.5 text-sand/80 hover:bg-cream/5 hover:text-gold" aria-label={`Edit ${r.name}`} title="Edit">
        <Pencil size={18} />
      </Link>
      <Link href={`/admin/products/${r.id}/preview`} className="rounded-full p-2.5 text-sand/80 hover:bg-cream/5 hover:text-gold" aria-label={`Preview ${r.name}`} title="Preview">
        <Eye size={18} />
      </Link>
      <button type="button" onClick={() => setToDelete(r)} className="rounded-full p-2.5 text-sand/80 hover:bg-[#c0583a]/20 hover:text-[#f0a18a]" aria-label={`Delete ${r.name}`} title="Delete">
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gold/20 bg-card/50 lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-bronze/40 text-xs uppercase tracking-[0.15em] text-sand/55">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Dish</th>
              <th scope="col" className="px-4 py-3 font-medium">Category</th>
              <th scope="col" className="px-4 py-3 font-medium">Portions</th>
              <th scope="col" className="px-4 py-3 font-medium">Starting price</th>
              <th scope="col" className="px-4 py-3 font-medium">Available</th>
              <th scope="col" className="px-4 py-3 font-medium">On website</th>
              <th scope="col" className="px-4 py-3 font-medium">Updated</th>
              <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bronze/25">
            {rows.map((r) => (
              <tr key={r.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={r.imageUrl} alt={r.imageAlt ?? r.name} />
                    <span>
                      <Link href={`/admin/products/${r.id}/edit`} className="font-medium text-cream hover:text-gold">{r.name}</Link>
                      {r.isFeatured && <span className="ml-2"><Badge tone="gold">Featured</Badge></span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sand/80">{r.categoryName ?? <span className="text-sand/45">None</span>}</td>
                <td className="px-4 py-3 text-sand/80 [font-variant-numeric:tabular-nums]">{r.portionCount}</td>
                <td className="px-4 py-3 text-cream [font-variant-numeric:tabular-nums]">{price(r)}</td>
                <td className="px-4 py-3">
                  <Toggle id={`avail-${r.id}`} label={r.isAvailable ? "Yes" : "Sold out"} checked={r.isAvailable} disabled={busyId === r.id} onChange={(v) => toggle(r, "isAvailable", v)} />
                </td>
                <td className="px-4 py-3">
                  <Toggle id={`pub-${r.id}`} label={r.isPublished ? "Published" : "Draft"} checked={r.isPublished} disabled={busyId === r.id} onChange={(v) => toggle(r, "isPublished", v)} />
                </td>
                <td className="px-4 py-3 text-xs text-sand/60">{formatDateTime(new Date(r.updatedAt))}</td>
                <td className="px-4 py-3">{actions(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl border border-gold/20 bg-card/60 p-4">
            <div className="flex gap-3">
              <Thumb src={r.imageUrl} alt={r.imageAlt ?? r.name} size={64} />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${r.id}/edit`} className="block font-medium text-cream hover:text-gold">{r.name}</Link>
                <p className="text-xs text-sand/60">{r.categoryName ?? "No category"} · {r.portionCount} portion{r.portionCount === 1 ? "" : "s"}</p>
                <p className="mt-1 text-sm text-cream">{price(r)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-bronze/30 pt-4">
              <Toggle id={`m-avail-${r.id}`} label="Available" description={r.isAvailable ? "Customers can order it" : "Shown as sold out"} checked={r.isAvailable} disabled={busyId === r.id} onChange={(v) => toggle(r, "isAvailable", v)} />
              <Toggle id={`m-pub-${r.id}`} label="Show on website" description={r.isPublished ? "Published" : "Draft (hidden)"} checked={r.isPublished} disabled={busyId === r.id} onChange={(v) => toggle(r, "isPublished", v)} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-sand/50">Updated {formatDateTime(new Date(r.updatedAt))}</span>
              {actions(r)}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this dish?"
        body={
          <>
            <strong className="text-cream">{toDelete?.name}</strong> and all its portions and photos will be permanently removed from your menu and website. This can&rsquo;t be undone.
            <br />
            <span className="mt-2 block">Tip: to hide it for now instead, switch off &ldquo;On website&rdquo;.</span>
          </>
        }
        confirmLabel="Delete permanently"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
