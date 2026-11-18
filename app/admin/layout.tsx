import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { ToastProvider } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { default: `Admin · ${brand.name}`, template: `%s · Admin · ${brand.name}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
