import { NextResponse } from "next/server";
import { assertSameOrigin, withErrors } from "@/lib/admin/api";
import { destroySession } from "@/lib/auth/session";

export const POST = withErrors(async (req: Request) => {
  assertSameOrigin(req);
  await destroySession();
  return NextResponse.json({ ok: true });
});
