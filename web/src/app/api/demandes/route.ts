import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appointmentRequests, db } from "@/db";
import { audit } from "@/lib/audit";
import { sendAdminNotification, sendRequesterConfirmation } from "@/lib/mail";
import { rateLimit } from "@/lib/ratelimit";
import { generateRef } from "@/lib/refs";
import { clientIp, hashIp } from "@/lib/request-info";
import { appointmentSchema, CONSENT_VERSION } from "@/lib/validation";

const MAX_BODY = 8 * 1024;
const MIN_FILL_MS = 3000;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const h = await headers();

  // CSRF : le navigateur envoie Origin ; on exige la même origine que l'hôte.
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host || new URL(origin).host !== host) return json({ error: "Requête refusée" }, 403);
  if (!h.get("content-type")?.startsWith("application/json")) return json({ error: "Format non supporté" }, 415);

  // Limitation de débit : par IP (5 / 10 min) et globale (100 / heure).
  const ip = await clientIp();
  if (!rateLimit(`demande:ip:${ip}`, 5, 10 * 60_000) || !rateLimit("demande:global", 100, 3600_000)) {
    return json({ error: "Trop de demandes. Réessayez plus tard." }, 429);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "Requête trop volumineuse" }, 413);
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return json({ error: "JSON invalide" }, 400);
  }

  // Anti-spam : champ piège (honeypot) + temps de remplissage minimal. Réponse « succès » factice pour ne rien révéler.
  const fillMs = Number(body.fillMs);
  if ((typeof body.website === "string" && body.website !== "") || !Number.isFinite(fillMs) || fillMs < MIN_FILL_MS) {
    await audit("demande.spam_bloquee", { detail: "honeypot/temps" });
    return json({ ref: "LSV-0000-000000" });
  }

  const result = appointmentSchema.safeParse(body);
  if (!result.success) return json({ error: "Données invalides", fields: z.flattenError(result.error).fieldErrors }, 422);
  const d = result.data;

  const months = Number(process.env.REQUEST_RETENTION_MONTHS ?? 12);
  const purgeAt = new Date();
  purgeAt.setMonth(purgeAt.getMonth() + months);

  let ref = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    ref = generateRef();
    try {
      await db.insert(appointmentRequests).values({
        ref,
        lastName: d.lastName,
        firstName: d.firstName,
        email: d.email,
        phone: d.phone,
        type: d.type,
        preferredDate: d.preferredDate ?? null,
        preferredSlot: d.preferredSlot ?? null,
        consentAt: new Date(),
        consentVersion: CONSENT_VERSION,
        purgeAt,
      });
      break;
    } catch (e) {
      const unique = typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
      if (!unique || attempt === 4) {
        console.error("[demande] insertion impossible", e instanceof Error ? e.message : e);
        return json({ error: "Une erreur est survenue. Réessayez plus tard." }, 500);
      }
    }
  }

  const mailData = { ref, firstName: d.firstName, lastName: d.lastName, email: d.email, type: d.type, preferredDate: d.preferredDate, preferredSlot: d.preferredSlot };
  // Un échec d'e-mail ne doit pas faire échouer la demande (déjà enregistrée) : on journalise.
  const results = await Promise.allSettled([sendAdminNotification(mailData), sendRequesterConfirmation(mailData)]);
  results.forEach((r, i) => r.status === "rejected" && console.error(`[mail] échec ${i === 0 ? "admin" : "demandeur"}`, r.reason instanceof Error ? r.reason.message : r.reason));
  await audit("demande.creee", { target: ref, detail: `ip=${hashIp(ip).slice(0, 8)}` });

  return json({ ref }, 201);
}
