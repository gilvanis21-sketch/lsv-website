import type { Metadata } from "next";
import { Card, Notice, PageHeader, Placeholder, Section, Tbd } from "@/components/ui";

export const metadata: Metadata = {
  title: "POLYMNIVOX",
  description: "Présentation institutionnelle de POLYMNIVOX, plateforme d'analyse de biomarqueurs acoustiques de la voix.",
  alternates: { canonical: "/polymnivox" },
};

const items = [
  ["Le concept", "Transformer un court enregistrement vocal en informations objectives et comparables dans le temps."],
  ["L'analyse vocale", "Étude des caractéristiques mesurables du signal vocal."],
  ["Les biomarqueurs acoustiques", "Indicateurs mesurables extraits de la voix. Liste et définitions à valider."],
  ["La mesure standardisée", "Des conditions de mesure homogènes pour permettre la comparaison."],
  ["L'interprétation prudente", "Les résultats sont des repères objectifs, à interpréter avec prudence. Ils ne constituent pas un diagnostic."],
  ["Le suivi de l'évolution", "Observer l'évolution des caractéristiques vocales au fil du temps."],
];

export default function Page() {
  return (
    <>
      <PageHeader title="POLYMNIVOX" lead="Une plateforme d'analyse de la voix développée indépendamment du site." />
      <Section>
        <Notice>Cette page présente POLYMNIVOX à titre informatif. Le site n&apos;intègre aucune analyse, aucun traitement audio ni aucun outil de la plateforme.</Notice>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map(([t, d]) => (<Card key={t} title={t}><p>{d} <Tbd /></p></Card>))}
        </div>
      </Section>
      <Section alt>
        <h2 className="text-3xl">Schéma explicatif</h2>
        <div className="mt-6"><Placeholder>Schéma : enregistrement → mesure standardisée → biomarqueurs → suivi dans le temps (illustration à produire après validation)</Placeholder></div>
      </Section>
    </>
  );
}
