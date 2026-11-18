import { readLocalImage } from "@/lib/storage";

/** Serves product photos uploaded to this server's disk (not used when Vercel Blob is configured). */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const data = await readLocalImage((await params).name);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
