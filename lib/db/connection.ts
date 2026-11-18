import fs from "node:fs";
import path from "node:path";
import type { Config } from "@libsql/client";

/** Builds libSQL connection options and makes sure a local database folder exists. */
export function connectionOptions(url: string, authToken?: string): Config {
  if (url.startsWith("file:")) {
    const file = url.slice("file:".length);
    try {
      fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    } catch {
      // Read-only disk (e.g. Vercel without DATABASE_URL set): queries will fail and pages show their fallbacks.
    }
    return { url };
  }
  return { url, authToken };
}
