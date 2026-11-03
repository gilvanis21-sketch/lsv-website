import { beforeAll, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, hotp, newSecret, verifyTotp, base32, unbase32 } from "../totp";

beforeAll(() => { process.env.APP_SECRET = "x".repeat(40); });

describe("TOTP", () => {
  it("respecte le vecteur de test RFC 4226 (secret '12345678901234567890')", () => {
    const secret = base32(Buffer.from("12345678901234567890"));
    expect([0, 1, 2, 3].map((c) => hotp(secret, c))).toEqual(["755224", "287082", "359152", "969429"]);
  });
  it("accepte ±1 pas, refuse au-delà et refuse le rejeu", () => {
    const s = newSecret(); const now = 1_700_000_000_000; const step = Math.floor(now / 30000);
    expect(verifyTotp(s, hotp(s, step), 0, now)).toBe(step);
    expect(verifyTotp(s, hotp(s, step - 1), 0, now)).toBe(step - 1);
    expect(verifyTotp(s, hotp(s, step - 3), 0, now)).toBeNull();
    expect(verifyTotp(s, hotp(s, step), step, now)).toBeNull();
    expect(verifyTotp(s, "abc123", 0, now)).toBeNull();
  });
  it("base32 aller-retour et chiffrement du secret au repos", () => {
    const b = Buffer.from("hello-lsv"); expect(unbase32(base32(b)).equals(b)).toBe(true);
    const s = newSecret(); const enc = encryptSecret(s);
    expect(enc).not.toContain(s); expect(decryptSecret(enc)).toBe(s);
    expect(() => decryptSecret(enc.replace(/.$/, "A"))).toThrow();
  });
});
