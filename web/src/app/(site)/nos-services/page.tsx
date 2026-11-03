import type { Metadata } from "next";
import { ButtonLink, Card, PageHeader, Section } from "@/components/ui";
import { getPublishedServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Nos services",
  description: "Bilan vocal, consultation et suivi vocal : découvrez les prestations du Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/nos-services" },
};

export default async function Page() {
  const SERVICES = await getPublishedServices();
  return (
    <>
      <PageHeader title="Nos services" lead="Des prestations pour mesurer, comprendre et suivre votre voix." />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => (
            <Card key={s.slug} title={s.title} href={`/nos-services/${s.slug}`}>
              <p>{s.summary}</p>
              {s.price && <p className="mt-2 font-semibold">{s.price}</p>}
            </Card>
          ))}
        </div>
        <div className="mt-10"><ButtonLink href="/contact">Demander un rendez-vous</ButtonLink></div>
      </Section>
    </>
  );
}
