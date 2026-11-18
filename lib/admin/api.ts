import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin, type SessionAdmin } from "@/lib/auth/session";
import { issuesToFieldErrors } from "./field-errors";

/** An error whose message is safe to show to the admin. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: Record<string, string[] | undefined>
  ) {
    super(message);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/**
 * Wraps every admin API route: same-origin check on changes, admin login check,
 * and one place that turns errors into safe JSON responses (no stack traces).
 */
export function adminRoute<C>(fn: (req: Request, ctx: C, admin: SessionAdmin) => Promise<Response>): Handler<C> {
  return withErrors(async (req, ctx) => {
    assertSameOrigin(req);
    const admin = await getCurrentAdmin();
    if (!admin) throw new ApiError(401, "Your session has ended. Please sign in again.");
    return fn(req, ctx, admin);
  });
}

export function withErrors<C>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message, fieldErrors: err.fieldErrors }, { status: err.status });
      }
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Some details need fixing.", fieldErrors: issuesToFieldErrors(err.issues) }, { status: 400 });
      }
      const reqId = randomUUID().slice(0, 8);
      console.error(`[admin-api ${reqId}]`, err);
      return NextResponse.json({ error: `Something went wrong. Please try again. (ref ${reqId})` }, { status: 500 });
    }
  };
}

/** Blocks cross-site form posts: changes must come from this site's own pages. */
export function assertSameOrigin(req: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let ok = false;
  try {
    ok = !!origin && !!host && new URL(origin).host === host;
  } catch {
    ok = false;
  }
  if (!ok) throw new ApiError(403, "This request was blocked for your security. Please reload the page and try again.");
}

const JSON_LIMIT = 100 * 1024;

/** Reads and validates a JSON body (max 100 KB). */
export async function readJson<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > JSON_LIMIT) throw new ApiError(413, "That request is too large.");
  const text = await req.text();
  if (text.length > JSON_LIMIT) throw new ApiError(413, "That request is too large.");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ApiError(400, "That request wasn't readable. Please try again.");
  }
  return schema.parse(body);
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(404, "Not found.");
  return id;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
