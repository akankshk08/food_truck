"use client";

/** Browser-side helper for calling the admin API with friendly errors. */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string[]> = {}
  ) {
    super(message);
  }
}

export async function adminFetch<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      credentials: "same-origin",
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiClientError("Couldn't reach the server. Check your internet connection and try again.", 0);
  }
  const body = await res.json().catch(() => ({}));
  // A 401 means the session ended, so go to the login page — except for the login request itself,
  // where it simply means a wrong password and the form shows the message.
  if (res.status === 401 && path !== "/api/admin/login") {
    window.location.href = "/admin/login";
    throw new ApiClientError(body.error ?? "Please sign in again.", 401);
  }
  if (!res.ok) throw new ApiClientError(body.error ?? `Something went wrong (${res.status}).`, res.status, body.fieldErrors ?? {});
  return body as T;
}

/** Uploads a file with progress updates (fetch can't report upload progress, XHR can). */
export function uploadWithProgress(file: Blob, filename: string, onProgress: (pct: number) => void): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/uploads");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const body = xhr.response ?? {};
      if (xhr.status === 401) window.location.href = "/admin/login";
      if (xhr.status >= 200 && xhr.status < 300 && body.url) resolve(body);
      else reject(new ApiClientError(body.error ?? "The photo couldn't be uploaded. Please try again.", xhr.status));
    };
    xhr.onerror = () => reject(new ApiClientError("Upload failed. Check your internet connection and try again.", 0));
    const form = new FormData();
    form.append("file", file, filename);
    xhr.send(form);
  });
}

const MAX_SIDE = 2000;
const SEND_LIMIT = 3.5 * 1024 * 1024;

/**
 * Phone photos are often huge. Shrink big ones in the browser before uploading
 * so uploads are quick and stay under the 4 MB limit. Small photos are sent as they are.
 */
export async function prepareImage(file: File): Promise<{ blob: Blob; name: string }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { blob: file, name: file.name };
  }
  const tooBig = Math.max(bitmap.width, bitmap.height) > MAX_SIDE * 1.2;
  if (!tooBig && file.size <= SEND_LIMIT) {
    bitmap.close();
    return { blob: file, name: file.name };
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
  return blob ? { blob, name: file.name.replace(/\.\w+$/, "") + ".jpg" } : { blob: file, name: file.name };
}
