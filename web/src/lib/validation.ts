import { z } from "zod";

// Zod tente d'utiliser eval() pour s'accélérer à la construction des schémas ; notre CSP l'interdit.
// Doit précéder toute définition de schéma.
z.config({ jitless: true });

const noMarkup = (v: string) => !/[<>\u0000-\u001f]/.test(v);
const name = (label: string) =>
  z.string().trim().min(1, `${label} requis`).max(80, `${label} trop long`).refine(noMarkup, `${label} : caractères non autorisés`);

export const SLOTS = ["matin", "apres_midi", "indifferent"] as const;
export const CONSENT_VERSION = "2026-11-v1";

export const appointmentSchema = z.object({
  lastName: name("Nom"),
  firstName: name("Prénom"),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Adresse e-mail invalide")),
  phone: z.string().trim().regex(/^\+?[\d\s().-]{6,20}$/, "Numéro de téléphone invalide"),
  type: z.enum(["premiere_consultation", "suivi"], { error: "Choisissez un type de demande" }),
  preferredDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide")
    .refine((v) => {
      if (!v) return true;
      const d = new Date(`${v}T00:00:00Z`);
      const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
      return !Number.isNaN(d.getTime()) && d >= today && d.getTime() - today.getTime() <= 365 * 86400000;
    }, "Choisissez une date à venir (dans l'année)"),
  preferredSlot: z.enum(SLOTS).optional(),
  consent: z.literal(true, { error: "Vous devez confirmer avoir pris connaissance de la politique de confidentialité" }),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const loginSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(200), code: z.string().max(10).default("") });

/** Mot de passe : 12 caractères minimum (recommandations CNIL/ANSSI : longueur avant complexité). */
export const passwordSchema = z.string().min(12, "12 caractères minimum").max(200);

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
