/* eslint-disable @next/next/no-img-element -- images téléversées servies par /media (pas de loader next/image) */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, PageHeader, Section } from "@/components/ui";
import { getPublishedPost } from "@/lib/queries";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getPublishedPost((await params).slug);
  if (!r) return {};
  return { title: r.post.title, description: r.post.excerpt || undefined, alternates: { canonical: `/actualites/${r.post.slug}` } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const r = await getPublishedPost(slug);
  if (!r) notFound();
  const { post, category } = r;
  // Corps en texte brut : paragraphes séparés par une ligne vide. Aucun HTML interprété (anti-XSS).
  const paragraphs = post.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), publisher: { "@type": "Organization", name: SITE.name }, ...(post.imagePath ? { image: `${SITE.url}/media/${post.imagePath}` } : {}) }} />
      <PageHeader title={post.title} lead={`${post.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(post.publishedAt) : ""}${category ? ` · ${category.name}` : ""}`} />
      <Section>
        <article className="max-w-3xl space-y-4">
          {post.imagePath && <img src={`/media/${post.imagePath}`} alt={post.imageAlt ?? ""} className="mb-6 w-full rounded-2xl" />}
          {paragraphs.map((p, i) => (<p key={i} className="whitespace-pre-line">{p}</p>))}
        </article>
      </Section>
    </>
  );
}
