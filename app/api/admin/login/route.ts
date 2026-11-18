import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ApiError, assertSameOrigin, clientIp, readJson, withErrors } from "@/lib/admin/api";
import { LoginInput } from "@/lib/admin/schemas";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import { clearRateLimit, hitRateLimit } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { admins } from "@/lib/db/schema";

const WINDOW = 15 * 60 * 1000;

export const POST = withErrors(async (req: Request) => {
  assertSameOrigin(req);
  const { email, password } = await readJson(req, LoginInput);

  const ipLimit = await hitRateLimit(`ip:${clientIp(req)}`, 30, WINDOW);
  const emailLimit = await hitRateLimit(`email:${email}`, 8, WINDOW);
  if (!ipLimit.ok || !emailLimit.ok) {
    const wait = Math.max(ipLimit.ok ? 0 : ipLimit.retryAfterSec, emailLimit.ok ? 0 : emailLimit.retryAfterSec);
    return NextResponse.json(
      { error: `Too many sign-in attempts. Please wait ${Math.ceil(wait / 60)} minute(s) and try again.` },
      { status: 429, headers: { "Retry-After": String(wait) } }
    );
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  // Always run a full password check so a wrong email takes as long as a wrong password.
  const ok = await verifyPassword(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin || !ok) throw new ApiError(401, "Wrong email or password.");

  await clearRateLimit(`email:${email}`);
  await createSession(admin.id);
  return NextResponse.json({ ok: true });
});
