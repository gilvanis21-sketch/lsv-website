/**
 * Contenus provisoires (aucune information inventée).
 * Tout texte marqué TBD doit être remplacé après validation du client.
 * Sprint 2 : ces données migreront en base (gérées depuis l'admin).
 */
export const TBD = "[À CONFIRMER]";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  objectives: string[];
  process: string[];
  practical: string[];
  price?: string; // affiché uniquement s'il est communiqué
};

export const SERVICES: Service[] = [
  {
    slug: "bilan-vocal",
    title: "Bilan vocal",
    summary: "Un état des lieux des caractéristiques de votre voix.",
    description: `Description de la prestation à fournir par le laboratoire. ${TBD}`,
    objectives: [`Objectifs du bilan vocal ${TBD}`],
    process: [`Étapes du déroulement ${TBD}`],
    practical: [`Durée, lieu, préparation ${TBD}`],
  },
  {
    slug: "consultation",
    title: "Consultation",
    summary: "Un échange avec le praticien autour de votre voix.",
    description: `Description de la prestation à fournir par le laboratoire. ${TBD}`,
    objectives: [`Objectifs de la consultation ${TBD}`],
    process: [`Étapes du déroulement ${TBD}`],
    practical: [`Durée, lieu, préparation ${TBD}`],
  },
  {
    slug: "suivi-vocal",
    title: "Suivi vocal",
    summary: "Suivre l'évolution de votre voix dans le temps.",
    description: `Description de la prestation à fournir par le laboratoire. ${TBD}`,
    objectives: [`Objectifs du suivi vocal ${TBD}`],
    process: [`Étapes du déroulement ${TBD}`],
    practical: [`Fréquence, durée, modalités ${TBD}`],
  },
];

export type Topic = { slug: string; title: string; summary: string; body: string };

export const TOPICS: Topic[] = [
  {
    slug: "dysphonies",
    title: "Les dysphonies",
    summary: "Altérations de la qualité de la voix.",
    body: `Contenu pédagogique à rédiger puis à faire valider par le client (et un relecteur médical si souhaité). ${TBD}`,
  },
  {
    slug: "troubles-de-l-emission-vocale",
    title: "Troubles de l'émission vocale",
    summary: "Difficultés liées à la production de la voix.",
    body: `Contenu pédagogique à rédiger puis à faire valider par le client. ${TBD}`,
  },
  {
    slug: "autres-anomalies",
    title: "Autres anomalies",
    summary: "Autres situations suivies par le laboratoire.",
    body: `Liste à définir avec le client. ${TBD}`,
  },
];

export const DISCLAIMER =
  "Ces informations sont pédagogiques. Elles ne constituent ni un diagnostic, ni un avis médical, ni une promesse thérapeutique.";
