import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

/** TOTP (RFC 6238) : SHA-1, 6 chiffres, pas de 30 s : compatible Google Authenticator, Aegis, FreeOTP, etc. */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
export function unbase32(s: string): Buffer {
  let bits = 0, value = 0; const out: number[] = [];
  for (const c of s.replace(/=+$/, "").toUpperCase()) {
    const i = B32.indexOf(c); if (i < 0) throw new Error("base32 invalide");
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const newSecret = () => base32(randomBytes(20));

export function hotp(secret: string, counter: number): string {
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", unbase32(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

/** Retourne le pas (counter) validé, ou null. Tolérance ±1 pas ; `lastStep` empêche le rejeu d'un code déjà utilisé. */
export function verifyTotp(secret: string, code: string, lastStep = 0, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const step = Math.floor(now / 30_000);
  for (const s of [step - 1, step, step + 1]) if (s > lastStep && hotp(secret, s) === code) return s;
  return null;
}

export const otpauthUri = (secret: string, account: string, issuer = "LSV") =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

// Chiffrement au repos du secret TOTP (AES-256-GCM, clé dérivée de APP_SECRET).
const key = () => {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 32) throw new Error("APP_SECRET manquant ou trop court");
  return createHash("sha256").update(`totp:${s}`).digest();
};
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12); const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
}
export function decryptSecret(stored: string): string {
  const [iv, tag, enc] = stored.split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}
