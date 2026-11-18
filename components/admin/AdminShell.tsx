"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, UtensilsCrossed, PlusCircle, Tags, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { brand } from "@/config/brand";
import { LogoMark } from "@/components/ui/Logo";
import { adminFetch } from "@/lib/admin/client";
import { useToast } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: UtensilsCrossed, exact: false },
  { href: "/admin/products/new", label: "Add product", icon: PlusCircle, exact: true },
  { href: "/admin/categories", label: "Categories", icon: Tags, exact: true },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && !pathname.startsWith("/admin/products/new");

  async function signOut() {
    setSigningOut(true);
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Couldn't sign out.");
      setSigningOut(false);
    }
  }

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              active ? "bg-gold/15 text-gold" : "text-sand/80 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <div className="hairline my-4" />
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-sand/80 hover:bg-cream/5 hover:text-cream">
        <ExternalLink size={18} strokeWidth={1.6} aria-hidden="true" />
        View website
      </a>
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-sand/80 hover:bg-cream/5 hover:text-cream disabled:opacity-50"
      >
        <LogOut size={18} strokeWidth={1.6} aria-hidden="true" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-forest lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-bronze/40 bg-forest-2 px-4 py-6 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <LogoMark className="h-10 w-10 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-[0.95rem] font-semibold tracking-[0.08em] text-cream">{brand.name}</span>
            <span className="text-[0.62rem] uppercase tracking-[0.3em] text-gold/80">Admin</span>
          </span>
        </Link>
        <div className="mt-8 flex-1">{nav}</div>
        <p className="truncate px-4 text-xs text-sand/50" title={email}>
          Signed in as {email}
        </p>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-bronze/40 bg-forest-2/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-9 w-9" />
          <span className="font-serif text-sm font-semibold tracking-[0.08em] text-cream">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-cream"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && (
        <div id="admin-mobile-nav" className="fixed inset-x-0 bottom-0 top-[65px] z-30 overflow-y-auto bg-forest-2 px-4 py-6 lg:hidden">
          {nav}
          <p className="mt-6 truncate px-4 text-xs text-sand/50">Signed in as {email}</p>
        </div>
      )}

      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
