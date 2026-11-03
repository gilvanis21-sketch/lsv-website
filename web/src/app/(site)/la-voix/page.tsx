import type { Metadata } from "next";
import { Card, Notice, PageHeader, Section } from "@/components/ui";
import { DISCLAIMER, TOPICS } from "@/lib/content";

export const metadata: Metadata = {
  title: "La voix : troubles et anomalies",
  description: "Informations pédagogiques sur les dysphonies, les troubles de l'émission vocale et autres anomalies de la voix.",
  alternates: { canonical: "/la-voix" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="La voix : maladies et anomalies" lead="Un espace pédagogique pour mieux comprendre les troubles de la voix." />
      <Section>
        <Notice>{DISCLAIMER}</Notice>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TOPICS.map((t) => (<Card key={t.slug} title={t.title} href={`/la-voix/${t.slug}`}><p>{t.summary}</p></Card>))}
        </div>
      </Section>
    </>
  );
}
