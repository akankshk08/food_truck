import { NextResponse } from "next/server";
import { adminRoute, ApiError, parseId, readJson } from "@/lib/admin/api";
import { revalidateMenu } from "@/lib/admin/revalidate";
import { CategoryInput } from "@/lib/admin/schemas";
import { deleteCategory, renameCategory } from "@/lib/data/categories";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = adminRoute<Ctx>(async (req, { params }) => {
  const id = parseId((await params).id);
  const { name } = await readJson(req, CategoryInput);
  const result = await renameCategory(id, name);
  if (!result.ok && result.reason === "duplicate") {
    throw new ApiError(409, `A category called "${name}" already exists.`, { name: ["Choose a different name."] });
  }
  if (!result.ok) throw new ApiError(404, "This category no longer exists.");
  revalidateMenu();
  return NextResponse.json({ id });
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
  const id = parseId((await params).id);
  const result = await deleteCategory(id);
  if (!result.ok && result.reason === "in_use") {
    throw new ApiError(
      409,
      `This category still has ${result.count} dish${result.count === 1 ? "" : "es"}. Move them to another category first.`
    );
  }
  if (!result.ok) throw new ApiError(404, "This category no longer exists.");
  revalidateMenu();
  return NextResponse.json({ ok: true });
});
