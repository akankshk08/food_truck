import "server-only";
import { z } from "zod";

/**
 * Server-side configuration, validated once at startup.
 * Nothing here is ever sent to the browser.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /** "file:./data/app.db" for a local SQLite file, or a Turso URL ("libsql://…"). */
  DATABASE_URL: z.string().min(1).default("file:./data/app.db"),
  /** Required for Turso; not used for a local file. */
  DATABASE_AUTH_TOKEN: z.string().optional(),
  /** When set, uploaded photos go to Vercel Blob. Otherwise they are saved in UPLOAD_DIR. */
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  UPLOAD_DIR: z.string().min(1).default("./data/uploads"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid server configuration: ${JSON.stringify(z.flattenError(parsed.error).fieldErrors)}`);
}

const env = parsed.data;
if (env.DATABASE_URL.startsWith("libsql://") && !env.DATABASE_AUTH_TOKEN) {
  throw new Error("DATABASE_AUTH_TOKEN is required when DATABASE_URL points to Turso.");
}

export default env;
