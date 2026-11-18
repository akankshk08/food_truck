import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import env from "@/lib/env";
import * as schema from "./schema";
import { connectionOptions } from "./connection";

function create() {
  const client = createClient(connectionOptions(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN));
  return drizzle(client, { schema });
}

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { __cskDb?: ReturnType<typeof create> };
export const db = globalForDb.__cskDb ?? create();
if (env.NODE_ENV !== "production") globalForDb.__cskDb = db;

export type Db = typeof db;
