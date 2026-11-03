"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { appointmentSchema } from "@/lib/validation";


type Errors = Record<string, string[] | undefined>;
const input = "mt-1 w-full rounded-lg border border-[#9fb4ba] px-3 py-2.5";

function FieldError({ id, msgs }: { id: string; msgs?: string[] }) {
  return msgs?.length ? <p id={id} role="alert" className="mt-1 text-sm text-[#b3261e]">{msgs[0]}</p> : null;
}

export function ContactForm() {
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const f = new FormData(e.currentTarget);
    const payload = {
      lastName: f.get("lastName"),
      firstName: f.get("firstName"),
      email: f.get("email"),
      phone: f.get("phone"),
      type: f.get("type") ?? undefined,
      preferredDate: f.get("preferredDate") || undefined,
      preferredSlot: f.get("preferredSlot") || undefined,
      consent: f.get("consent") === "on",
    };
    const check = appointmentSchema.safeParse(payload);
    if (!check.success) {
      setErrors(z.flattenError(check.error).fieldErrors as Errors);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website: f.get("website"), fillMs: Date.now() - started.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setRef(data.ref);
      else if (res.status === 422) setErrors(data.fields ?? {});
      else setFormError(data.error ?? "Une erreur est survenue. Réessayez plus tard.");
    } catch {
      setFormError("Connexion impossible. Réessayez plus tard.");
    } finally {
      setBusy(false);
    }
  }

  if (ref) {
    return (
      <div role="status" className="max-w-2xl rounded-xl border border-turq bg-[#e4f5f3] p-6">
        <h2 className="text-2xl">Votre demande a bien été reçue</h2>
        <p className="mt-2">Référence : <strong className="font-mono">{ref}</strong></p>
        <p className="mt-2">Un e-mail de confirmation vous a été envoyé. <strong>Il s&apos;agit d&apos;une demande, pas d&apos;une réservation</strong> : le laboratoire vous recontactera pour confirmer un créneau.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-2xl gap-5" aria-label="Demande de rendez-vous">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="lastName" className="font-semibold">Nom *</label><input id="lastName" name="lastName" autoComplete="family-name" maxLength={80} aria-invalid={!!errors.lastName} aria-describedby="e-lastName" className={input} /><FieldError id="e-lastName" msgs={errors.lastName} /></div>
        <div><label htmlFor="firstName" className="font-semibold">Prénom *</label><input id="firstName" name="firstName" autoComplete="given-name" maxLength={80} aria-invalid={!!errors.firstName} aria-describedby="e-firstName" className={input} /><FieldError id="e-firstName" msgs={errors.firstName} /></div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="email" className="font-semibold">Adresse e-mail *</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={!!errors.email} aria-describedby="e-email" className={input} /><FieldError id="e-email" msgs={errors.email} /></div>
        <div><label htmlFor="phone" className="font-semibold">Téléphone *</label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={20} aria-invalid={!!errors.phone} aria-describedby="e-phone" className={input} /><FieldError id="e-phone" msgs={errors.phone} /></div>
      </div>
      <fieldset>
        <legend className="font-semibold">Type de demande *</legend>
        <label className="mt-1 flex items-center gap-2"><input type="radio" name="type" value="premiere_consultation" /> Première consultation</label>
        <label className="flex items-center gap-2"><input type="radio" name="type" value="suivi" /> Suivi</label>
        <FieldError id="e-type" msgs={errors.type} />
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="preferredDate" className="font-semibold">Date souhaitée</label><input id="preferredDate" name="preferredDate" type="date" className={input} /><FieldError id="e-date" msgs={errors.preferredDate} /></div>
        <div><label htmlFor="preferredSlot" className="font-semibold">Plage horaire</label><select id="preferredSlot" name="preferredSlot" className={input} defaultValue="indifferent"><option value="indifferent">Indifférent</option><option value="matin">Matin</option><option value="apres_midi">Après-midi</option></select></div>
      </div>
      {/* Champ piège anti-spam : invisible pour les humains. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div>
        <label className="flex items-start gap-2"><input type="checkbox" name="consent" className="mt-1.5" aria-describedby="e-consent" /><span>J&apos;ai pris connaissance de la <Link href="/confidentialite" className="font-semibold text-turq-text underline">politique de confidentialité</Link> : mes données servent uniquement à traiter ma demande de rendez-vous. *</span></label>
        <FieldError id="e-consent" msgs={errors.consent} />
      </div>
      {formError && <p role="alert" className="rounded-md bg-[#fdeceb] px-4 py-3 text-[#8c1d18]">{formError}</p>}
      <div><button type="submit" disabled={busy} className="rounded-lg border-2 border-petrol bg-petrol px-6 py-3 font-semibold text-white hover:bg-petrol-dark disabled:opacity-60">{busy ? "Envoi…" : "Envoyer ma demande"}</button></div>
    </form>
  );
}
