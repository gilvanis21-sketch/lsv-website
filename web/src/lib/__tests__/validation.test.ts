import { describe, expect, it } from "vitest";
import { appointmentSchema, loginSchema, passwordSchema, slugify } from "../validation";

const valid = { lastName: "Test", firstName: "Alpha", email: "ALPHA@Test.example ", phone: "+33 1 23 45 67 89", type: "suivi", consent: true };

describe("appointmentSchema", () => {
  it("accepte une demande valide et normalise l'e-mail", () => {
    const r = appointmentSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("alpha@test.example");
  });
  it.each([
    ["balises HTML dans le nom", { lastName: "<script>alert(1)</script>" }],
    ["prénom vide", { firstName: "  " }],
    ["e-mail invalide", { email: "pas-un-email" }],
    ["téléphone invalide", { phone: "abc" }],
    ["type inconnu", { type: "urgence" }],
    ["consentement absent", { consent: false }],
    ["date passée", { preferredDate: "2020-01-01" }],
    ["date mal formée", { preferredDate: "15/01/2027" }],
    ["nom trop long", { lastName: "a".repeat(81) }],
    ["caractère de contrôle", { lastName: "Te\u0000st" }],
  ])("refuse : %s", (_l, patch) => {
    expect(appointmentSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it("traite les tentatives d'injection SQL comme du texte (requêtes paramétrées) mais refuse < >", () => {
    expect(appointmentSchema.safeParse({ ...valid, lastName: "Robert'); DROP TABLE users;--" }).success).toBe(true);
    expect(appointmentSchema.safeParse({ ...valid, lastName: "a<b" }).success).toBe(false);
  });
});

describe("autres schémas", () => {
  it("mot de passe : 12 caractères minimum", () => {
    expect(passwordSchema.safeParse("court").success).toBe(false);
    expect(passwordSchema.safeParse("un-mot-de-passe-long").success).toBe(true);
  });
  it("login : e-mail requis", () => {
    expect(loginSchema.safeParse({ email: "x", password: "y" }).success).toBe(false);
  });
  it("slugify retire accents et symboles", () => {
    expect(slugify("Été : Voix & Santé !")).toBe("ete-voix-sante");
  });
});
