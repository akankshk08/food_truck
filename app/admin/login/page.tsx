import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LogoMark } from "@/components/ui/Logo";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-forest px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgb(215 182 106 / 0.10), transparent 70%)" }}
      />
      <div className="relative w-full max-w-md rounded-[28px] border border-gold/25 bg-forest-2 p-8 shadow-soft sm:p-10">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <p className="eyebrow mt-6">Admin</p>
          <h1 className="mt-3 font-serif text-4xl text-cream">{brand.name}</h1>
          <p className="mt-2 text-sm text-sand/65">Sign in to manage your menu.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
