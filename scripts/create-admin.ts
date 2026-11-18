/**
 * Creates an admin account, or resets the password of an existing one.
 * There is deliberately no public sign-up page.
 *
 *   npm run admin:create -- owner@example.com
 *
 * You'll be asked for the password (it is not shown while you type).
 * Resetting a password also signs that admin out everywhere.
 */
import readline from "node:readline";
import { Writable } from "node:stream";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { connectionOptions } from "../lib/db/connection";
import { hashPassword, PASSWORD_MAX, PASSWORD_MIN } from "../lib/auth/password";
import * as schema from "../lib/db/schema";

function ask(question: string, hidden = false): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
    muted = hidden;
  });
}

async function main() {
  const email = (process.argv[2] ?? (await ask("Admin email: "))).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That doesn't look like an email address.");

  // ADMIN_PASSWORD lets automated setups run this without a prompt; never commit it anywhere.
  const password = process.env.ADMIN_PASSWORD ?? (await ask(`Password (${PASSWORD_MIN}+ characters): `, true));
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    throw new Error(`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`);
  }
  if (!process.env.ADMIN_PASSWORD && (await ask("Repeat password: ", true)) !== password) {
    throw new Error("The passwords don't match.");
  }

  const client = createClient(connectionOptions(process.env.DATABASE_URL ?? "file:./data/app.db", process.env.DATABASE_AUTH_TOKEN));
  const db = drizzle(client, { schema });
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(schema.admins).where(eq(schema.admins.email, email));

  if (existing) {
    await db.update(schema.admins).set({ passwordHash }).where(eq(schema.admins.id, existing.id));
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.adminId, existing.id));
    console.log(`Password updated for ${email}. They have been signed out of all devices.`);
  } else {
    await db.insert(schema.admins).values({ email, passwordHash });
    console.log(`Admin account created for ${email}. Sign in at /admin/login.`);
  }
  client.close();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
