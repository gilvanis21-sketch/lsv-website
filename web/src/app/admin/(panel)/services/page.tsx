import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, services } from "@/db";
import { requirePermission } from "@/lib/auth";
import { btn, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const [{ e }, rows] = await Promise.all([searchParams, db.select().from(services).orderBy(asc(services.position))]);
  return (
    <>
      <Title action={<Link href="/admin/services/nouveau" className={btn}>Nouveau service</Link>}>Services</Title>
      <Flash code={e} />
      <ul className="grid max-w-2xl gap-2">
        {rows.map((s) => (<li key={s.id} className="rounded-xl border border-line bg-white p-4"><Link className="font-semibold text-turq-text underline" href={`/admin/services/${s.id}`}>{s.title}</Link> {!s.published && <em className="text-sm">(masqué)</em>}</li>))}
      </ul>
    </>
  );
}
