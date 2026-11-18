import { requireAdminPage } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

/** Every page inside the admin panel requires a valid session (checked on the server). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
