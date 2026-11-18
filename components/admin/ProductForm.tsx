"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { adminFetch, ApiClientError } from "@/lib/admin/client";
import { paiseToRupeesInput, ProductInput, rupeesToPaise, type ProductInputType } from "@/lib/admin/schemas";
import { issuesToFieldErrors } from "@/lib/admin/field-errors";
import ImageUploader from "./ImageUploader";
import PortionsEditor, { newPortion, type PortionDraft } from "./PortionsEditor";
import { Button, Card, ConfirmDialog, Field, inputClass, toastAfterNavigation, Toggle, useToast } from "./ui";

export type ProductFormInitial = {
  id: number;
  name: string;
  subtitle: string | null;
  shortDescription: string;
  description: string;
  categoryId: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  images: { url: string; alt: string | null }[];
  isVeg: boolean;
  spiceLevel: number;
  isFeatured: boolean;
  isAvailable: boolean;
  isPublished: boolean;
  sortOrder: number;
  variants: { portionName: string; quantity: string | null; unit: string | null; pricePaise: number; description: string | null; isAvailable: boolean }[];
};

type Draft = {
  name: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  imageUrl: string | null;
  imageAlt: string;
  images: { key: string; url: string | null; alt: string }[];
  isVeg: boolean;
  spiceLevel: number;
  isFeatured: boolean;
  isAvailable: boolean;
  isPublished: boolean;
  sortOrder: string;
  variants: PortionDraft[];
};

const key = () => Math.random().toString(36).slice(2);

function toDraft(p?: ProductFormInitial): Draft {
  return {
    name: p?.name ?? "",
    subtitle: p?.subtitle ?? "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    categoryId: p?.categoryId ? String(p.categoryId) : "",
    imageUrl: p?.imageUrl ?? null,
    imageAlt: p?.imageAlt ?? "",
    images: (p?.images ?? []).map((i) => ({ key: key(), url: i.url, alt: i.alt ?? "" })),
    isVeg: p?.isVeg ?? false,
    spiceLevel: p?.spiceLevel ?? 0,
    isFeatured: p?.isFeatured ?? false,
    isAvailable: p?.isAvailable ?? true,
    isPublished: p?.isPublished ?? false,
    sortOrder: String(p?.sortOrder ?? 100),
    variants: p
      ? p.variants.map((v) => ({
          key: key(),
          portionName: v.portionName,
          quantity: v.quantity ?? "",
          unit: v.unit ?? "",
          price: paiseToRupeesInput(v.pricePaise),
          description: v.description ?? "",
          isAvailable: v.isAvailable,
        }))
      : [newPortion()],
  };
}

/** Converts the form into what the server expects, plus any price typos found on the way. */
function toInput(d: Draft): { input: unknown; priceErrors: Record<string, string> } {
  const priceErrors: Record<string, string> = {};
  const variants = d.variants.map((v, i) => {
    const paise = v.price.trim() === "" ? undefined : rupeesToPaise(v.price);
    if (paise === null) priceErrors[`variants.${i}.pricePaise`] = "Enter a price like 180 or 180.50.";
    return {
      portionName: v.portionName,
      quantity: v.quantity,
      unit: v.unit || null,
      pricePaise: paise ?? undefined,
      description: v.description,
      isAvailable: v.isAvailable,
    };
  });
  return {
    priceErrors,
    input: {
      name: d.name,
      subtitle: d.subtitle,
      shortDescription: d.shortDescription,
      description: d.description,
      categoryId: d.categoryId ? Number(d.categoryId) : null,
      imageUrl: d.imageUrl,
      imageAlt: d.imageAlt,
      additionalImages: d.images.filter((i) => i.url).map((i) => ({ url: i.url, alt: i.alt })),
      isVeg: d.isVeg,
      spiceLevel: d.spiceLevel,
      isFeatured: d.isFeatured,
      isAvailable: d.isAvailable,
      isPublished: d.isPublished,
      sortOrder: Number(d.sortOrder) || 0,
      variants,
    },
  };
}

export default function ProductForm({ categories, initial }: { categories: { id: number; name: string }[]; initial?: ProductFormInitial }) {
  const router = useRouter();
  const toast = useToast();
  // One starting copy for both, so "unsaved changes" compares like with like.
  const [start] = useState(() => toDraft(initial));
  const [draft, setDraft] = useState<Draft>(start);
  const [saved, setSaved] = useState(() => JSON.stringify(start));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const leavingRef = useRef(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== saved, [draft, saved]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    // Hide a field's error once it's being corrected (it is checked again on save).
    if (k !== "variants") setErrors((e) => (e[k] ? omit(e, (key) => key === k) : e));
  };
  const setVariants = (next: PortionDraft[]) => {
    const changed = new Set(next.flatMap((v, i) => (JSON.stringify(v) !== JSON.stringify(draft.variants[i]) ? [i] : [])));
    setDraft((d) => ({ ...d, variants: next }));
    setErrors((e) => omit(e, (key) => key.startsWith("variants.") && (next.length !== draft.variants.length || changed.has(Number(key.split(".")[1])))));
  };
  const onBusy = (busy: boolean) => setUploads((n) => n + (busy ? 1 : -1));

  // Warn before closing the tab or following a link with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || leavingRef.current) return;
      if (!window.confirm("You have unsaved changes. Leave this page and lose them?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  function leave() {
    leavingRef.current = true;
    router.push("/admin/products");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploads > 0) return toast("error", "Please wait for the photo to finish uploading.");

    const { input, priceErrors } = toInput(draft);
    const parsed = ProductInput.safeParse(input);
    const found = { ...(parsed.success ? {} : flatten(issuesToFieldErrors(parsed.error.issues))), ...priceErrors };
    if (Object.keys(found).length) return showErrors(found);

    setSaving(true);
    try {
      const body = parsed.data as ProductInputType;
      if (initial) {
        await adminFetch(`/api/admin/products/${initial.id}`, { method: "PUT", json: body });
        setSaved(JSON.stringify(draft));
        setErrors({});
        toast("success", `Saved. ${body.isPublished ? "The website now shows your changes." : "This dish is a draft, so it stays hidden from the website."}`);
        router.refresh();
      } else {
        await adminFetch("/api/admin/products", { method: "POST", json: body });
        toastAfterNavigation(`${body.name} was added${body.isPublished ? " and is now on your website" : " as a draft"}.`);
        leave();
      }
    } catch (err) {
      if (err instanceof ApiClientError && Object.keys(err.fieldErrors).length) showErrors(flatten(err.fieldErrors));
      else toast("error", err instanceof Error ? err.message : "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function showErrors(found: Record<string, string>) {
    setErrors(found);
    toast("error", "Some details need fixing — they're highlighted below.");
    const first = Object.keys(found)[0].replace(/\./g, "-");
    requestAnimationFrame(() => document.getElementById(first === "imageUrl" ? "image-main" : first)?.focus());
  }

  const err = (k: string) => errors[k];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 pb-28">
      <Card>
        <h2 className="font-serif text-2xl text-cream">Basic information</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field id="name" label="Dish name" required error={err("name")}>
            <input id="name" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chicken Sukka" className={inputClass} aria-invalid={!!err("name")} />
          </Field>
          <Field id="subtitle" label="Subtitle (optional)" hint='Shown under the name, e.g. "Mangalorean dry roast".' error={err("subtitle")}>
            <input id="subtitle" value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <Field id="shortDescription" label="Short description" required hint={`Shown on the menu card. ${draft.shortDescription.length}/300`} error={err("shortDescription")}>
              <textarea id="shortDescription" rows={3} value={draft.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputClass} aria-invalid={!!err("shortDescription")} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field id="description" label="Full description (optional)" hint="Ingredients, how it's cooked, serving suggestions." error={err("description")}>
              <textarea id="description" rows={5} value={draft.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field id="categoryId" label="Category" error={err("categoryId")} hint={categories.length ? undefined : "No categories yet — add some on the Categories page."}>
            <select id="categoryId" value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="sortOrder" label="Menu position" hint="Lower numbers appear first on the website.">
            <input id="sortOrder" type="number" min={0} max={9999} value={draft.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-cream">Photos</h2>
        <p className="mt-1 text-sm text-sand/65">The main photo appears on the menu card. Big photos are resized automatically.</p>
        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="flex flex-col gap-4">
            <ImageUploader id="image-main" label="Main photo" value={draft.imageUrl} onChange={(u) => set("imageUrl", u)} onBusyChange={onBusy} error={err("imageUrl")} />
            <Field id="imageAlt" label="Describe the photo (optional)" hint="Helps visually impaired customers and search engines." error={err("imageAlt")}>
              <input id="imageAlt" value={draft.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} placeholder="e.g. Chicken sukka in a brass bowl" className={inputClass} />
            </Field>
          </div>
          <div>
            <p className="text-sm font-medium text-cream">Extra photos (optional)</p>
            <p className="text-xs text-sand/55">Shown in the product preview. Up to 8.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {draft.images.map((img, i) => (
                <div key={img.key} className="flex flex-col gap-1">
                  <ImageUploader
                    id={`extra-${i}`}
                    label={`Extra photo ${i + 1}`}
                    compact
                    value={img.url}
                    onBusyChange={onBusy}
                    onChange={(u) => set("images", u ? draft.images.map((x) => (x.key === img.key ? { ...x, url: u } : x)) : draft.images.filter((x) => x.key !== img.key))}
                  />
                  {!img.url && (
                    <button type="button" onClick={() => set("images", draft.images.filter((x) => x.key !== img.key))} className="inline-flex items-center justify-center gap-1 text-xs text-sand/60 hover:text-[#f0a18a]">
                      <Trash2 size={12} aria-hidden="true" /> Remove slot
                    </button>
                  )}
                </div>
              ))}
              {draft.images.length < 8 && (
                <button type="button" onClick={() => set("images", [...draft.images, { key: key(), url: null, alt: "" }])} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gold/30 text-sm text-sand/70 hover:border-gold hover:text-gold">
                  <Plus size={20} aria-hidden="true" /> Add extra photo
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-cream">Portions &amp; prices</h2>
        <p className="mt-1 text-sm text-sand/65">Add every size you sell, each with its own price. Customers pick one on the website.</p>
        <div className="mt-5">
          <PortionsEditor value={draft.variants} onChange={setVariants} errors={errors} />
        </div>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl text-cream">Display &amp; status</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Toggle id="isPublished" label="Show on website" description={draft.isPublished ? "Published — customers can see it" : "Draft — hidden from customers"} checked={draft.isPublished} onChange={(v) => set("isPublished", v)} />
            <Toggle id="isAvailable" label="Available today" description={draft.isAvailable ? "Customers can order it" : 'Shown as "Currently Unavailable"'} checked={draft.isAvailable} onChange={(v) => set("isAvailable", v)} />
            <Toggle id="isFeatured" label="Featured" description='Adds the "Signature Speciality" badge' checked={draft.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Toggle id="isVeg" label="Vegetarian" description="Shows the green veg mark" checked={draft.isVeg} onChange={(v) => set("isVeg", v)} />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-cream">Spice level</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((n) => (
                <label key={n} className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm ${draft.spiceLevel === n ? "border-gold bg-gold/15 text-gold" : "border-bronze/60 text-sand/75"}`}>
                  <input type="radio" name="spiceLevel" value={n} checked={draft.spiceLevel === n} onChange={() => set("spiceLevel", n)} className="sr-only" />
                  {n === 0 ? "Not shown" : Array.from({ length: n }, (_, i) => <Flame key={i} size={14} aria-hidden="true" />)}
                  {n > 0 && <span className="sr-only">{n} of 3</span>}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bronze/50 bg-forest-2/95 px-4 py-3 backdrop-blur lg:left-[17rem]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="hidden text-sm text-sand/65 sm:block" aria-live="polite">
            {uploads > 0 ? "Uploading photo…" : dirty ? "You have unsaved changes." : initial ? "All changes saved." : ""}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={() => (dirty ? setConfirmLeave(true) : leave())}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={uploads > 0} className="flex-1 sm:flex-none">
              {initial ? "Save changes" : draft.isPublished ? "Save & publish" : "Save draft"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title="Discard your changes?"
        body="You've made changes that haven't been saved. If you leave now, they'll be lost."
        confirmLabel="Discard changes"
        onConfirm={leave}
        onCancel={() => setConfirmLeave(false)}
      />
    </form>
  );
}

function omit(errors: Record<string, string>, drop: (key: string) => boolean): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter(([k]) => !drop(k)));
}

function flatten(fieldErrors: Record<string, string[] | string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldErrors)) {
    const msg = Array.isArray(v) ? v[0] : v;
    if (msg) out[k === "additionalImages" ? "imageUrl" : k] = msg;
  }
  return out;
}
