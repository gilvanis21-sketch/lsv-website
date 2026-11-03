/* eslint-disable @next/next/no-img-element -- images téléversées servies par /media (pas de loader next/image) */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui";
import { getCategories, getPublishedPosts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités du Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/actualites" },
};


const fmt = (d: Date | null) => (d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d) : "");

export default async function Page({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const [rows, cats] = await Promise.all([getPublishedPosts(categorie), getCategories()]);
  return (
    <>
      <PageHeader title="Actualités" />
      <Section>
        {cats.length > 0 && (
          <nav aria-label="Catégories" className="mb-8 flex flex-wrap gap-2">
            <Link href="/actualites" className={`rounded-full border px-4 py-1.5 text-sm ${!categorie ? "bg-petrol text-white" : "border-line"}`}>Toutes</Link>
            {cats.map((c) => (<Link key={c.id} href={`/actualites?categorie=${c.slug}`} className={`rounded-full border px-4 py-1.5 text-sm ${categorie === c.slug ? "bg-petrol text-white" : "border-line"}`}>{c.name}</Link>))}
          </nav>
        )}
        {rows.length === 0 ? <p>Aucun article publié pour le moment.</p> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ post, category }) => (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-line">
                {post.imagePath && <img src={`/media/${post.imagePath}`} alt={post.imageAlt ?? ""} className="h-48 w-full object-cover" loading="lazy" />}
                <div className="p-5">
                  <p className="text-sm text-[#4b6a73]">{fmt(post.publishedAt)}{category ? ` · ${category.name}` : ""}</p>
                  <h2 className="mt-1 text-xl"><Link href={`/actualites/${post.slug}`} className="hover:underline">{post.title}</Link></h2>
                  <p className="mt-2">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
