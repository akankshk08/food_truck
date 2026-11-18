import "server-only";
import sharp from "sharp";
import { ApiError } from "./api";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

/**
 * Checks an uploaded photo really is a JPG/PNG/WebP, then turns the right way up,
 * shrinks it to at most 2000px, removes hidden data (like GPS location) and saves as WebP.
 */
export async function processUpload(file: File): Promise<Buffer> {
  if (!ALLOWED_TYPES.has(file.type)) throw new ApiError(400, "Please choose a JPG, PNG or WebP photo.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "That photo is too large. Please use one under 4 MB.");
  if (file.size === 0) throw new ApiError(400, "That file is empty.");

  const input = Buffer.from(await file.arrayBuffer());
  let format: string | undefined;
  try {
    format = (await sharp(input, { limitInputPixels: 50_000_000 }).metadata()).format;
  } catch {
    throw new ApiError(400, "That file isn't a photo we can read. Please try another one.");
  }
  if (!format || !ALLOWED_FORMATS.has(format)) throw new ApiError(400, "Please choose a JPG, PNG or WebP photo.");

  return sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
