import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink, JsonLd, PageHeader, Section } from "@/components/ui";
import { getServiceBySlug } from "@/lib/queries";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getServiceBySlug((await params).slug);
  if (!s) return {};
  return { title: s.title, description: s.summary, alternates: { canonical: `/nos-services/${s.slug}` } };
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  if (!s) notFound();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.summary, provider: { "@type": "Organization", name: SITE.name } }} />
      <PageHeader title={s.title} lead={s.summary} />
      <Section>
        <p className="max-w-3xl whitespace-pre-line">{s.description}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <List title="Objectifs" items={s.objectives} />
          <List title="Déroulement" items={s.process} />
          <List title="Informations pratiques" items={s.practical} />
        </div>
        {s.price && <p className="mt-8 text-lg font-semibold">Tarif : {s.price}</p>}
        <div className="mt-10"><ButtonLink href="/contact">Demander un rendez-vous</ButtonLink></div>
      </Section>
    </>
  );
}
