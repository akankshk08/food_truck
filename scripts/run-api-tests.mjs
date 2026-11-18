/**
 * Runs the API tests against a real server with a throwaway database.
 * Your normal database and photos are never touched.
 *
 *   npm run build && npm run test:api
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "csk-test-"));
const port = 3900 + Math.floor(Math.random() * 90);
const env = {
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: `file:${path.join(dir, "test.db")}`,
  DATABASE_AUTH_TOKEN: "",
  BLOB_READ_WRITE_TOKEN: "",
  BLOB_STORE_ID: "",
  UPLOAD_DIR: path.join(dir, "uploads"),
  ADMIN_PASSWORD: "test-password-" + Math.random().toString(36).slice(2),
  TEST_ADMIN_EMAIL: "tester@example.com",
  TEST_BASE_URL: `http://localhost:${port}`,
};
const tsx = path.join("node_modules", "tsx", "dist", "cli.mjs");
const run = (args) => {
  const r = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run([tsx, "scripts/db-setup.ts"]);
run([tsx, "scripts/create-admin.ts", env.TEST_ADMIN_EMAIL]);

const server = spawn(process.execPath, [path.join("node_modules", "next", "dist", "bin", "next"), "start", "-p", String(port)], { env, stdio: "pipe" });
server.stderr.on("data", (d) => process.stderr.write(d));

let ready = false;
for (let i = 0; i < 60 && !ready; i++) {
  await new Promise((r) => setTimeout(r, 500));
  ready = await fetch(env.TEST_BASE_URL + "/admin/login").then(() => true, () => false);
}
if (!ready) {
  server.kill();
  console.error("Server did not start");
  process.exit(1);
}

const t = spawnSync(process.execPath, ["--test", "tests/api.test.mjs"], { env, stdio: "inherit" });
server.kill();
fs.rmSync(dir, { recursive: true, force: true });
process.exit(t.status ?? 1);
