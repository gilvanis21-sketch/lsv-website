import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { generateRef } from "../refs";
import { SAFE_NAME, saveImage } from "../uploads";

describe("generateRef", () => {
  it("respecte le format LSV-AAAA-XXXXXX", () => {
    expect(generateRef(2026)).toMatch(/^LSV-2026-[A-HJ-NP-Z2-9]{6}$/);
  });
  it("est suffisamment aléatoire", () => {
    expect(new Set(Array.from({ length: 500 }, () => generateRef())).size).toBeGreaterThan(495);
  });
});

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64");

describe("saveImage", () => {
  beforeAll(() => { process.env.UPLOAD_DIR = mkdtempSync(path.join(tmpdir(), "lsv-")); });
  it("accepte un vrai PNG et génère un nom aléatoire sûr", async () => {
    const name = await saveImage(new File([PNG], "photo.png"));
    expect(name).toMatch(SAFE_NAME);
    expect(readdirSync(process.env.UPLOAD_DIR!)).toContain(name);
  });
  it("ignore l'extension déclarée : un HTML nommé .png est refusé", async () => {
    await expect(saveImage(new File(["<html></html>"], "x.png", { type: "image/png" }))).rejects.toThrow();
  });
  it("refuse un SVG (vecteur XSS) et un fichier trop lourd ou vide", async () => {
    await expect(saveImage(new File(["<svg onload=alert(1)>"], "x.svg", { type: "image/svg+xml" }))).rejects.toThrow();
    await expect(saveImage(new File([Buffer.concat([PNG, Buffer.alloc(3.2 * 1024 * 1024)])], "big.png"))).rejects.toThrow(/lourde/);
    await expect(saveImage(new File([], "vide.png"))).rejects.toThrow();
  });
  it("le motif de nom refuse la traversée de répertoire", () => {
    for (const bad of ["../../etc/passwd", "a.html", "..%2f.env", "abc.png"]) expect(SAFE_NAME.test(bad)).toBe(false);
  });
});
