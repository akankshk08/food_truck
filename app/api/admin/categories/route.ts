import { NextResponse } from "next/server";
import { adminRoute, ApiError, readJson } from "@/lib/admin/api";
import { revalidateMenu } from "@/lib/admin/revalidate";
import { CategoryInput } from "@/lib/admin/schemas";
import { createCategory, listCategoriesWithCounts } from "@/lib/data/categories";

export const GET = adminRoute(async () => NextResponse.json(await listCategoriesWithCounts()));

export const POST = adminRoute(async (req) => {
  const { name } = await readJson(req, CategoryInput);
  const result = await createCategory(name);
  if (!result.ok) throw new ApiError(409, `A category called "${name}" already exists.`, { name: ["Choose a different name."] });
  revalidateMenu();
  return NextResponse.json({ id: result.id }, { status: 201 });
});
