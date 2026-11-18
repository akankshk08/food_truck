import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { loginAttempts } from "@/lib/db/schema";

/**
 * Counts an attempt for `key` and reports whether it is still within `limit` per window.
 * Stored in the database so the limit holds across server instances.
 */
export async function hitRateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const resetAt = now + windowMs;
  const [row] = await db
    .insert(loginAttempts)
    .values({ key, count: 1, resetAt: new Date(resetAt) })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: {
        count: sql`CASE WHEN ${loginAttempts.resetAt} <= ${now} THEN 1 ELSE ${loginAttempts.count} + 1 END`,
        resetAt: sql`CASE WHEN ${loginAttempts.resetAt} <= ${now} THEN ${resetAt} ELSE ${loginAttempts.resetAt} END`,
      },
    })
    .returning();
  return { ok: row.count <= limit, retryAfterSec: Math.max(1, Math.ceil((row.resetAt.getTime() - now) / 1000)) };
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
