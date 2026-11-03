import type { Metadata } from "next";
import { ButtonLink, Card, Notice, Placeholder, Section, Tbd, Wave } from "@/components/ui";
import { DISCLAIMER, TOPICS } from "@/lib/content";
import { getPublishedServices } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} (LSV) : science et mesure de la voix` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const SERVICES = await getPublishedServices();
  return (
    <>
      <div className="relative overflow-hidden py-20 md:py-28">
        <Wave className="pointer-events-none absolute -right-6 top-14 hidden w-[40%] lg:block" />
        <div className="relative mx-auto max-w-6xl px-6">
          <h1 className="max-w-xl text-4xl md:text-5xl lg:text-6xl">Comprendre la voix par la mesure <Tbd>titre à valider</Tbd></h1>
          <p className="mt-5 max-w-xl text-lg md:text-xl">
            Le Laboratoire Scientifique de la Voix étudie les caractéristiques mesurables du signal vocal, avec une approche objective et prudente. <Tbd>texte à valider</Tbd>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Prendre rendez-vous</ButtonLink>
            <ButtonLink href="/nos-services" variant="outline">Découvrir nos services</ButtonLink>
          </div>
        </div>
      </div>

      <Section alt>
        <h2 className="text-3xl">Nos prestations</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => (
            <Card key={s.slug} title={s.title} href={`/nos-services/${s.slug}`}><p>{s.summary}</p></Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Placeholder>Schéma POLYMNIVOX : enregistrement → biomarqueurs → suivi dans le temps (illustration, aucune fonction)</Placeholder>
          <div>
            <h2 className="text-3xl">POLYMNIVOX</h2>
            <p className="mt-3">Plateforme développée indépendamment, qui vise à transformer un court enregistrement vocal en informations objectives et comparables dans le temps. Présentation à titre informatif.</p>
            <div className="mt-6"><ButtonLink href="/polymnivox" variant="outline">Découvrir POLYMNIVOX</ButtonLink></div>
          </div>
        </div>
      </Section>

      <Section alt>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">Votre praticien</h2>
            <p className="mt-3">M. Fadi Dahdouh, ostéopathe et chef d&apos;entreprise. <Tbd>parcours et qualifications à fournir : rien n&apos;est affiché sans justificatif</Tbd></p>
            <p className="mt-4"><a className="font-semibold text-turq-text hover:underline" href="/le-laboratoire#praticien">Découvrir le parcours →</a></p>
          </div>
          <Placeholder>Photo professionnelle (à fournir)</Placeholder>
        </div>
      </Section>

      <Section>
        <h2 className="text-3xl">Comprendre les troubles de la voix</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TOPICS.map((t) => (<Card key={t.slug} title={t.title} href={`/la-voix/${t.slug}`}><p>{t.summary}</p></Card>))}
        </div>
        <div className="mt-6"><Notice>{DISCLAIMER}</Notice></div>
      </Section>

      <section className="bg-petrol py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl !text-white">Une question, un rendez-vous ?</h2>
          <p className="mt-3">Envoyez une demande : nous reviendrons vers vous pour confirmer un créneau.</p>
          <div className="mt-6"><ButtonLink href="/contact" variant="light">Demander un rendez-vous</ButtonLink></div>
        </div>
      </section>
    </>
  );
}
