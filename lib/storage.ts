import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import env from "@/lib/env";

/**
 * Where uploaded product photos live.
 * - Vercel Blob when a Blob store is connected (BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN is set).
 *   Needed on Vercel, whose disk is read-only.
 * - Otherwise a folder on this server (UPLOAD_DIR), served at /media/<file>.
 * Only the resulting URL is stored in the database.
 */

const LOCAL_NAME = /^[a-f0-9-]{36}\.webp$/;

/** Blob is used when a store is connected. Without an explicit token, the library signs in via Vercel OIDC. */
const useBlob = () => !!(env.BLOB_STORE_ID || env.BLOB_READ_WRITE_TOKEN);
const blobToken = () => env.BLOB_READ_WRITE_TOKEN || undefined;

export function uploadDir(): string {
  return path.resolve(env.UPLOAD_DIR);
}

export async function saveImage(data: Buffer): Promise<string> {
  const name = `${randomUUID()}.webp`;
  if (useBlob()) {
    const blob = await put(`products/${name}`, data, {
      access: "public",
      contentType: "image/webp",
      token: blobToken(),
      addRandomSuffix: false,
    });
    return blob.url;
  }
  await fs.mkdir(uploadDir(), { recursive: true });
  await fs.writeFile(path.join(uploadDir(), name), data);
  return `/media/${name}`;
}

/** Deletes a photo we uploaded. Bundled site photos (/images/…) are never touched. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith("/media/")) {
      const name = url.slice("/media/".length);
      if (LOCAL_NAME.test(name)) await fs.rm(path.join(uploadDir(), name), { force: true });
    } else if (url.startsWith("https://") && url.includes(".public.blob.vercel-storage.com/") && useBlob()) {
      await del(url, { token: blobToken() });
    }
  } catch (err) {
    // A leftover file is harmless; don't fail the user's action over it.
    console.error("Could not delete image", url, err);
  }
}

export async function readLocalImage(name: string): Promise<Buffer | null> {
  if (!LOCAL_NAME.test(name)) return null;
  try {
    return await fs.readFile(path.join(uploadDir(), name));
  } catch {
    return null;
  }
}
