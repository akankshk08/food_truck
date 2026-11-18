import { NextResponse } from "next/server";
import { adminRoute, ApiError } from "@/lib/admin/api";
import { MAX_UPLOAD_BYTES, processUpload } from "@/lib/admin/image";
import { saveImage } from "@/lib/storage";

/** Upload one product photo. Returns its URL; the photo is linked to a dish when the form is saved. */
export const POST = adminRoute(async (req) => {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) throw new ApiError(413, "That photo is too large. Please use one under 4 MB.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "The upload didn't arrive correctly. Please try again.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Please choose a photo to upload.");

  const processed = await processUpload(file);
  const url = await saveImage(processed);
  return NextResponse.json({ url }, { status: 201 });
});
