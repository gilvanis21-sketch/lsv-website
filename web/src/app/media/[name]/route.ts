import { readFile } from "node:fs/promises";
import path from "node:path";
import { SAFE_NAME, UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!SAFE_NAME.test(name)) return new Response("Introuvable", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR(), name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": TYPES[name.split(".")[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
