"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";

/* ── Buttons ───────────────────────────────────────────────── */

const BTN = {
  primary: "bg-gold text-forest hover:bg-gold-soft border border-gold",
  secondary: "border border-gold/50 text-gold hover:bg-gold/10",
  ghost: "border border-cream/15 text-cream/85 hover:border-gold/60 hover:text-gold",
  danger: "border border-[#c0583a]/70 text-[#f0a18a] hover:bg-[#c0583a] hover:text-cream",
} as const;

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BTN[variant]} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ── Form fields ───────────────────────────────────────────── */

export { inputClass } from "./styles";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-cream">
        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-[#f0a18a]" role="alert">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-sand/55">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** An on/off switch with a visible label. */
export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-cream">
          {label}
        </label>
        {description && <span className="text-xs text-sand/55">{description}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:opacity-50 ${
          checked ? "border-gold bg-gold" : "border-bronze bg-forest"
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full transition-transform ${checked ? "translate-x-6 bg-forest" : "translate-x-1 bg-sand/60"}`} />
      </button>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "gold" | "muted" | "red"; children: ReactNode }) {
  const tones = {
    green: "border-[#4f9a5a]/60 bg-[#4f9a5a]/15 text-[#9fd3a6]",
    gold: "border-gold/50 bg-gold/10 text-gold",
    muted: "border-cream/15 bg-cream/5 text-sand/70",
    red: "border-[#c0583a]/60 bg-[#c0583a]/15 text-[#f0a18a]",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-2xl border border-gold/20 bg-card/70 p-5 sm:p-7 ${className}`}>{children}</section>;
}

/* ── Confirm dialog ────────────────────────────────────────── */

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = "danger",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-gold/30 bg-forest-2 p-0 text-cream backdrop:bg-black/70"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-serif text-2xl text-cream">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-sand/80">{body}</div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/* ── Toasts ────────────────────────────────────────────────── */

type Toast = { id: number; tone: "success" | "error"; text: string };
const ToastContext = createContext<(tone: Toast["tone"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 8000 : 4000);
  }, []);

  // Messages that should survive a page change (e.g. "Saved" after redirecting to the list).
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("csk-toast");
      if (pending) {
        sessionStorage.removeItem("csk-toast");
        push("success", pending);
      }
    } catch {}
  }, [push]);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-soft ${
              t.tone === "success" ? "border-[#4f9a5a]/60 bg-[#173320] text-cream" : "border-[#c0583a]/70 bg-[#3a1d16] text-cream"
            }`}
          >
            {t.tone === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#9fd3a6]" aria-hidden="true" />
            ) : (
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#f0a18a]" aria-hidden="true" />
            )}
            <span className="flex-1">{t.text}</span>
            <button type="button" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss" className="text-sand/60 hover:text-cream">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** Show a success message on the next page (after a redirect). */
export function toastAfterNavigation(text: string) {
  try {
    sessionStorage.setItem("csk-toast", text);
  } catch {}
}
