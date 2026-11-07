import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { SiteImage } from "@/config/brand";

export type ResolvedImage = SiteImage & {
  /** Real file path in /public, or null when only the placeholder is available. */
  file: string | null;
};

const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png"];

/**
 * Looks for a photo in /public matching the configured base path.
 * Runs at build time, so dropping a photo into /public/images and
 * rebuilding is all it takes to replace a placeholder.
 */
export function resolveImage(image: SiteImage): ResolvedImage {
  const base = image.src.replace(/\.(avif|webp|jpe?g|png)$/i, "");
  const candidates = /\.(avif|webp|jpe?g|png)$/i.test(image.src)
    ? [image.src]
    : EXTENSIONS.map((ext) => base + ext);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(process.cwd(), "public", candidate))) {
      return { ...image, file: candidate };
    }
  }
  return { ...image, file: null };
}
