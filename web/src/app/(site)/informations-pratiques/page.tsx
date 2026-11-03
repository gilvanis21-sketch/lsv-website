import type { Metadata } from "next";
import { PageHeader, Section, Tbd } from "@/components/ui";
import { getSettings, SETTING_KEYS } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Informations pratiques",
  description: "Coordonnées, adresse, horaires, tarifs et accès au Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/informations-pratiques" },
};

export default async function Page() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Informations pratiques" />
      <Section>
        <dl className="grid max-w-3xl gap-6">
          {Object.entries(SETTING_KEYS).map(([key, label]) => (
            <div key={key}>
              <dt className="font-display text-xl font-bold text-petrol">{label}</dt>
              <dd className="mt-1 whitespace-pre-line">{settings[key] ?? <Tbd>à fournir par le client</Tbd>}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
