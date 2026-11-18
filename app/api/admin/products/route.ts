import { NextResponse } from "next/server";
import { adminRoute, ApiError, readJson } from "@/lib/admin/api";
import { ProductInput, ProductListQuery } from "@/lib/admin/schemas";
import { assertCategoryExists, createProduct, listProductsForAdmin } from "@/lib/data/products";
import { revalidateMenu } from "@/lib/admin/revalidate";

export const GET = adminRoute(async (req) => {
  const query = ProductListQuery.parse(Object.fromEntries(new URL(req.url).searchParams));
  const result = await listProductsForAdmin({ q: query.q, categoryId: query.category, page: query.page });
  return NextResponse.json(result);
});

export const POST = adminRoute(async (req) => {
  const input = await readJson(req, ProductInput);
  if (!(await assertCategoryExists(input.categoryId))) {
    throw new ApiError(400, "That category no longer exists. Please pick another.", { categoryId: ["Pick a category."] });
  }
  const id = await createProduct(input);
  revalidateMenu();
  return NextResponse.json({ id }, { status: 201 });
});
