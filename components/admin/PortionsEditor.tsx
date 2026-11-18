"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { UNITS } from "@/lib/admin/schemas";
import { Field, inputClass, Toggle } from "./ui";

export type PortionDraft = {
  key: string;
  portionName: string;
  quantity: string;
  unit: string;
  price: string;
  description: string;
  isAvailable: boolean;
};

export const newPortion = (): PortionDraft => ({
  key: Math.random().toString(36).slice(2),
  portionName: "",
  quantity: "",
  unit: "g",
  price: "",
  description: "",
  isAvailable: true,
});

type Props = {
  value: PortionDraft[];
  onChange: (v: PortionDraft[]) => void;
  errors: Record<string, string>;
};

/** Add as many portion sizes as needed, each with its own price. */
export default function PortionsEditor({ value, onChange, errors }: Props) {
  const update = (i: number, patch: Partial<PortionDraft>) => onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-gold/30 p-5 text-sm text-sand/70">
          No portions yet. Until you add one, the website shows &ldquo;Coming Soon&rdquo; instead of a price.
        </p>
      )}

      {value.map((p, i) => {
        const err = (field: string) => errors[`variants.${i}.${field}`];
        const fid = (field: string) => `variants-${i}-${field}`;
        return (
          <fieldset key={p.key} className="rounded-2xl border border-bronze/50 bg-forest/40 p-4 sm:p-5">
            <legend className="sr-only">Portion {i + 1}</legend>
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="font-serif text-xl text-gold">{p.portionName || `Portion ${i + 1}`}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-full p-2 text-sand/70 hover:text-gold disabled:opacity-30" aria-label={`Move portion ${i + 1} up`}>
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded-full p-2 text-sand/70 hover:text-gold disabled:opacity-30" aria-label={`Move portion ${i + 1} down`}>
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-[#f0a18a] hover:bg-[#c0583a]/20"
                >
                  <Trash2 size={14} aria-hidden="true" /> Remove portion
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.7fr_1fr]">
              <Field id={fid("portionName")} label="Portion name" required error={err("portionName")}>
                <input id={fid("portionName")} value={p.portionName} onChange={(e) => update(i, { portionName: e.target.value })} placeholder="e.g. Small, Half, Family Pack" className={inputClass} aria-invalid={!!err("portionName")} />
              </Field>
              <Field id={fid("quantity")} label="Amount" error={err("quantity")}>
                <input id={fid("quantity")} value={p.quantity} onChange={(e) => update(i, { quantity: e.target.value })} inputMode="decimal" placeholder="e.g. 250" className={inputClass} aria-invalid={!!err("quantity")} />
              </Field>
              <Field id={fid("unit")} label="Unit">
                <select id={fid("unit")} value={p.unit} onChange={(e) => update(i, { unit: e.target.value })} className={inputClass}>
                  <option value="">—</option>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id={fid("pricePaise")} label="Price (₹)" required error={err("pricePaise")}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true">₹</span>
                  <input id={fid("pricePaise")} value={p.price} onChange={(e) => update(i, { price: e.target.value })} inputMode="decimal" placeholder="e.g. 180" className={`${inputClass} pl-9`} aria-invalid={!!err("pricePaise")} />
                </div>
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field id={fid("description")} label="Note (optional)" error={err("description")}>
                <input id={fid("description")} value={p.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="e.g. Serves 2" className={inputClass} />
              </Field>
              <div className="sm:min-w-56 sm:pb-2">
                <Toggle id={fid("isAvailable")} label="Available" description={p.isAvailable ? "Customers can choose it" : "Shown as sold out"} checked={p.isAvailable} onChange={(v) => update(i, { isAvailable: v })} />
              </div>
            </div>
          </fieldset>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...value, newPortion()])}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/40 text-sm font-semibold text-gold hover:border-gold hover:bg-gold/5"
      >
        <Plus size={18} aria-hidden="true" /> {value.length ? "Add another portion" : "Add a portion"}
      </button>
    </div>
  );
}
