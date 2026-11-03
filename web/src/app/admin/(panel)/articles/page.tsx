import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, posts } from "@/db";
import { requirePermission } from "@/lib/auth";
import { btn, dt, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const [{ e }, rows] = await Promise.all([searchParams, db.select().from(posts).orderBy(desc(posts.updatedAt)).limit(200)]);
  return (
    <>
      <Title action={<Link href="/admin/articles/nouveau" className={btn}>Nouvel article</Link>}>Articles</Title>
      <Flash code={e} />
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left"><thead className="bg-mist"><tr>{["Titre", "Statut", "Publication", "Modifié"].map((h) => (<th key={h} className="px-4 py-3">{h}</th>))}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center">Aucun article.</td></tr>}
            {rows.map((p) => (<tr key={p.id} className="border-t border-line"><td className="px-4 py-3"><Link className="font-semibold text-turq-text underline" href={`/admin/articles/${p.id}`}>{p.title}</Link></td><td className="px-4 py-3">{p.status === "publie" ? "Publié" : "Brouillon"}</td><td className="px-4 py-3">{dt(p.publishedAt)}</td><td className="px-4 py-3">{dt(p.updatedAt)}</td></tr>))}
          </tbody></table>
      </div>
    </>
  );
}
