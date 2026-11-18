import "server-only";
import { notFound } from "next/navigation";
import { getProductForAdmin } from "@/lib/data/products";

/** Loads a dish for an admin page from the URL id, or shows the 404 page. */
export async function loadProductOr404(rawId: string) {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const product = await getProductForAdmin(id);
  if (!product) notFound();
  return product;
}
