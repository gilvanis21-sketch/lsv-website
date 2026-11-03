import { describe, expect, it } from "vitest";
import { rateLimit } from "../ratelimit";

describe("rateLimit", () => {
  it("bloque après la limite puis libère à la fin de la fenêtre", () => {
    const k = "t-" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000, 0)).toBe(true);
    expect(rateLimit(k, 3, 1000, 500)).toBe(false);
    expect(rateLimit(k, 3, 1000, 1001)).toBe(true);
  });
  it("isole les clés", () => {
    expect(rateLimit("a1", 1, 1000, 0)).toBe(true);
    expect(rateLimit("b1", 1, 1000, 0)).toBe(true);
  });
});
