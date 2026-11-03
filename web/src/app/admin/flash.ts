/** Messages d'erreur/succès par code : l'URL ne transporte jamais de texte libre (anti-usurpation). */
export const FLASH: Record<string, { text: string; ok?: boolean }> = {
  saved: { text: "Enregistré.", ok: true },
  deleted: { text: "Supprimé.", ok: true },
  invalid: { text: "Données invalides : vérifiez les champs." },
  slug: { text: "Ce lien (slug) est déjà utilisé." },
  image: { text: "Image refusée (JPEG, PNG ou WebP, 3 Mo maximum)." },
  last_admin: { text: "Action refusée : il doit rester au moins un administrateur actif." },
  self: { text: "Vous ne pouvez pas modifier votre propre rôle ou votre propre statut." },
  exists: { text: "Cet e-mail existe déjà." },
  totp: { text: "Code de vérification incorrect." },
  password: { text: "Mot de passe invalide (12 caractères minimum)." },
};
