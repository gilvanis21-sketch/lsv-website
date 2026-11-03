import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/** IP du client. Derrière Caddy, X-Forwarded-For est fiable (le proxy l'écrase). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}

/** IP pseudonymisée (HMAC) pour le journal : pas d'IP en clair stockée. */
export function hashIp(ip: string): string {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 32) throw new Error("APP_SECRET manquant ou trop court (>= 32 caractères)");
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

/** La requête est-elle arrivée en HTTPS ? (Caddy renseigne X-Forwarded-Proto ; en local direct : http.) */
export async function isHttps(): Promise<boolean> {
  const h = await headers();
  return (h.get("x-forwarded-proto") ?? "").split(",")[0].trim() === "https";
}
