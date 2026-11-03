/** Configuration du site. Les valeurs « À CONFIRMER » doivent être validées par le client. */
export const SITE = {
  name: "Laboratoire Scientifique de la Voix",
  short: "LSV",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Le Laboratoire Scientifique de la Voix étudie les caractéristiques mesurables du signal vocal : bilan, consultation et suivi vocal.",
  practitioner: "Fadi Dahdouh",
} as const;

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/le-laboratoire", label: "Le laboratoire" },
  { href: "/nos-services", label: "Nos services" },
  { href: "/la-voix", label: "La voix" },
  { href: "/polymnivox", label: "POLYMNIVOX" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = [
  { href: "/references", label: "Références" },
  { href: "/informations-pratiques", label: "Informations pratiques" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
] as const;
