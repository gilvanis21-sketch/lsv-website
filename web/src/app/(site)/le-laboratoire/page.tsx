import type { Metadata } from "next";
import { PageHeader, Section, Tbd } from "@/components/ui";

export const metadata: Metadata = {
  title: "Le laboratoire",
  description: "Histoire, mission, vision, approche scientifique et valeurs du Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/le-laboratoire" },
};

const blocks = [
  ["Notre histoire", "Histoire du LSV à fournir par le client."],
  ["Notre mission", "Mission du laboratoire à valider."],
  ["Notre vision", "Vision à valider."],
  ["Notre approche scientifique", "Approche fondée sur la mesure objective et l'interprétation prudente des caractéristiques du signal vocal. Détails à valider."],
  ["Nos valeurs", "Valeurs à définir avec le client."],
];

export default function Page() {
  return (
    <>
      <PageHeader title="Le laboratoire" lead="L'approche scientifique du LSV au service de la compréhension de la voix." />
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          {blocks.map(([h, t]) => (
            <div key={h}><h2 className="text-2xl">{h}</h2><p className="mt-2">{t} <Tbd /></p></div>
          ))}
        </div>
      </Section>
      <Section alt>
        <h2 id="praticien" className="text-3xl">M. Fadi Dahdouh</h2>
        <p className="mt-3 max-w-2xl">Ostéopathe et chef d&apos;entreprise, responsable du laboratoire.</p>
        <p className="mt-3 max-w-2xl">Parcours, diplômes, certifications et expériences : <Tbd>à fournir avec justificatifs. Aucune qualification n&apos;est publiée sans validation.</Tbd></p>
      </Section>
    </>
  );
}
