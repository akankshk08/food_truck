"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { adminFetch, ApiClientError } from "@/lib/admin/client";
import { CategoryInput } from "@/lib/admin/schemas";
import { Button, Card, ConfirmDialog, inputClass, useToast } from "./ui";

type Cat = { id: number; name: string; productCount: number };

export default function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const toast = useToast();
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ id: number; name: string; error?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Cat | null>(null);

  const check = (name: string) => {
    const r = CategoryInput.safeParse({ name });
    return r.success ? null : r.error.issues[0].message;
  };

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const problem = check(newName);
    if (problem) return setAddError(problem);
    setAdding(true);
    try {
      await adminFetch("/api/admin/categories", { method: "POST", json: { name: newName } });
      toast("success", `Category "${newName.trim()}" added.`);
      setNewName("");
      setAddError(null);
      router.refresh();
    } catch (err) {
      setAddError(err instanceof ApiClientError ? err.message : "Couldn't add the category.");
    } finally {
      setAdding(false);
    }
  }

  async function rename() {
    if (!editing) return;
    const problem = check(editing.name);
    if (problem) return setEditing({ ...editing, error: problem });
    setBusy(true);
    try {
      await adminFetch(`/api/admin/categories/${editing.id}`, { method: "PATCH", json: { name: editing.name } });
      toast("success", "Category renamed.");
      setEditing(null);
      router.refresh();
    } catch (err) {
      setEditing({ ...editing, error: err instanceof Error ? err.message : "Couldn't rename." });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!toDelete) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
      toast("success", `Category "${toDelete.name}" deleted.`);
      setToDelete(null);
      router.refresh();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Couldn't delete.");
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Card className="p-0 sm:p-0">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sand/70">No categories yet. Add your first one.</p>
        ) : (
          <ul className="divide-y divide-bronze/30">
            {categories.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-7">
                {editing?.id === c.id ? (
                  <div className="flex w-full flex-col gap-2">
                    <label htmlFor={`rename-${c.id}`} className="sr-only">New name for {c.name}</label>
                    <div className="flex gap-2">
                      <input
                        id={`rename-${c.id}`}
                        value={editing.name}
                        autoFocus
                        onChange={(e) => setEditing({ ...editing, name: e.target.value, error: undefined })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") rename();
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className={inputClass}
                        aria-invalid={!!editing.error}
                      />
                      <button type="button" onClick={rename} disabled={busy} className="rounded-full p-3 text-gold hover:bg-gold/10" aria-label="Save name">
                        <Check size={18} />
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="rounded-full p-3 text-sand/70 hover:bg-cream/5" aria-label="Cancel renaming">
                        <X size={18} />
                      </button>
                    </div>
                    {editing.error && <p role="alert" className="text-sm text-[#f0a18a]">{editing.error}</p>}
                  </div>
                ) : (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-cream">{c.name}</span>
                      <span className="text-xs text-sand/55">{c.productCount} dish{c.productCount === 1 ? "" : "es"}</span>
                    </span>
                    <button type="button" onClick={() => setEditing({ id: c.id, name: c.name })} className="rounded-full p-2.5 text-sand/80 hover:bg-cream/5 hover:text-gold" aria-label={`Rename ${c.name}`}>
                      <Pencil size={17} />
                    </button>
                    <button type="button" onClick={() => setToDelete(c)} className="rounded-full p-2.5 text-sand/80 hover:bg-[#c0583a]/20 hover:text-[#f0a18a]" aria-label={`Delete ${c.name}`}>
                      <Trash2 size={17} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <form onSubmit={add} noValidate className="flex flex-col gap-3">
          <label htmlFor="new-category" className="font-serif text-2xl text-cream">Add a category</label>
          <input
            id="new-category"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setAddError(null);
            }}
            placeholder="e.g. Seafood"
            className={inputClass}
            aria-invalid={!!addError}
          />
          {addError && <p role="alert" className="text-sm text-[#f0a18a]">{addError}</p>}
          <Button type="submit" loading={adding}>
            <Plus size={16} aria-hidden="true" /> Add category
          </Button>
        </form>
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title={toDelete?.productCount ? "This category is in use" : "Delete this category?"}
        body={
          toDelete?.productCount
            ? `"${toDelete.name}" still has ${toDelete.productCount} dish${toDelete.productCount === 1 ? "" : "es"}. Move them to another category first, then delete it.`
            : `"${toDelete?.name}" will be removed. No dishes use it.`
        }
        confirmLabel={toDelete?.productCount ? "OK" : "Delete category"}
        tone={toDelete?.productCount ? "primary" : "danger"}
        busy={busy}
        onConfirm={toDelete?.productCount ? () => setToDelete(null) : remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
