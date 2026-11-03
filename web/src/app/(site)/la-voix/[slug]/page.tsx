import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink, Notice, PageHeader, Section } from "@/components/ui";
import { DISCLAIMER, TOPICS } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) return {};
  return { title: t.title, description: t.summary, alternates: { canonical: `/la-voix/${t.slug}` } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) notFound();
  return (
    <>
      <PageHeader title={t.title} lead={t.summary} />
      <Section>
        <p className="max-w-3xl">{t.body}</p>
        <div className="mt-6 max-w-3xl"><Notice>{DISCLAIMER}</Notice></div>
        <div className="mt-8"><ButtonLink href="/contact" variant="outline">Demander un rendez-vous</ButtonLink></div>
      </Section>
    </>
  );
}
