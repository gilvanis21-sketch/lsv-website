import Link from "next/link";
import { count } from "drizzle-orm";
import { appointmentRequests, db } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { card, StatusPill, Title } from "../ui";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ refuse?: string }> }) {
  const user = await requireUser();
  const { refuse } = await searchParams;
  const counts = can(user.role, "requests")
    ? await db.select({ status: appointmentRequests.status, n: count() }).from(appointmentRequests).groupBy(appointmentRequests.status)
    : [];
  return (
    <>
      <Title>Tableau de bord</Title>
      {refuse && <p role="alert" className="mb-4 rounded-md bg-[#fdeceb] px-4 py-3 text-[#8c1d18]">Vous n&apos;avez pas les droits pour accéder à cette section.</p>}
      <p>Bonjour {user.name}.</p>
      {can(user.role, "requests") && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["nouvelle", "en_attente", "confirmee", "refusee", "traitee"] as const).map((s) => (
            <Link key={s} href={`/admin/demandes?statut=${s}`} className={`${card} hover:shadow`}>
              <StatusPill status={s} />
              <p className="mt-2 font-display text-3xl font-bold text-petrol">{counts.find((c) => c.status === s)?.n ?? 0}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
