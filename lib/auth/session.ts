import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { admins, adminSessions } from "@/lib/db/schema";
import env from "@/lib/env";

export const SESSION_COOKIE = "csk_admin_session";
const SESSION_DAYS = 7;

export type SessionAdmin = { id: number; email: string; name: string | null };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(adminId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(adminSessions).values({ id: hashToken(token), adminId, expiresAt });
  // Housekeeping: drop expired sessions.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The logged-in admin for this request, or null. Checked against the database every time. */
export const getCurrentAdmin = cache(async (): Promise<SessionAdmin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const rows = await db
    .select({ id: admins.id, email: admins.email, name: admins.name })
    .from(adminSessions)
    .innerJoin(admins, eq(admins.id, adminSessions.adminId))
    .where(and(eq(adminSessions.id, hashToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

/** For admin pages: sends visitors who aren't logged in to the login page. */
export async function requireAdminPage(): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(adminSessions).where(eq(adminSessions.id, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}
