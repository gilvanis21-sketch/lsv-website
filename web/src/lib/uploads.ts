import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = () => process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const MAX_BYTES = 3 * 1024 * 1024;

/** Détection par signature (octets magiques), jamais par nom ou type MIME déclaré. */
function sniff(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new Error("Fichier vide");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (3 Mo maximum)");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new Error("Format non autorisé (JPEG, PNG ou WebP uniquement)");
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(UPLOAD_DIR(), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR(), name), buf);
  return name;
}

export const SAFE_NAME = /^[a-f0-9]{24}\.(jpg|png|webp)$/;
