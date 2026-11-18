import { NextResponse } from "next/server";
import { adminRoute, ApiError, parseId, readJson } from "@/lib/admin/api";
import { revalidateMenu } from "@/lib/admin/revalidate";
import { ProductFlagsInput, ProductInput } from "@/lib/admin/schemas";
import { assertCategoryExists, deleteProduct, getProductForAdmin, setProductFlags, updateProduct } from "@/lib/data/products";
import { deleteImage } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => new ApiError(404, "This dish no longer exists. It may have been deleted.");

export const GET = adminRoute<Ctx>(async (_req, { params }) => {
  const product = await getProductForAdmin(parseId((await params).id));
  if (!product) throw notFound();
  return NextResponse.json(product);
});

/** Save the whole edit form. */
export const PUT = adminRoute<Ctx>(async (req, { params }) => {
  const id = parseId((await params).id);
  const input = await readJson(req, ProductInput);
  if (!(await assertCategoryExists(input.categoryId))) {
    throw new ApiError(400, "That category no longer exists. Please pick another.", { categoryId: ["Pick a category."] });
  }
  const unused = await updateProduct(id, input);
  if (unused === null) throw notFound();
  await Promise.all(unused.map(deleteImage));
  revalidateMenu();
  return NextResponse.json({ id });
});

/** Quick toggles from the product list: available / published. */
export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const id = parseId((await params).id);
  const flags = await readJson(req, ProductFlagsInput);
  const updated = await setProductFlags(id, flags);
  if (!updated) throw notFound();
  revalidateMenu();
  return NextResponse.json(updated);
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const id = parseId((await params).id);
  const photos = await deleteProduct(id);
  if (photos === null) throw notFound();
  await Promise.all(photos.map(deleteImage));
  revalidateMenu();
  return NextResponse.json({ ok: true });
});
