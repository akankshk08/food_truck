import "server-only";
import { revalidatePath } from "next/cache";

/** Refresh the public menu and admin pages after a change. */
export function revalidateMenu() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}
