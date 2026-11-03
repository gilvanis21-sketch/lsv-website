import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { appointmentRequests as r, db } from "@/db";
import { requirePermission } from "@/lib/auth";
import { purgeExpiredAction } from "../../actions";
import { btnOutline, dt, field, Flash, STATUS_LABEL, StatusPill, Title } from "../../ui";

const TYPE = { premiere_consultation: "1ʳᵉ consultation", suivi: "Suivi" } as const;
const STATUSES = ["nouvelle", "en_attente", "confirmee", "refusee", "traitee"] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string; e?: string }> }) {
  await requirePermission("requests");
  const { statut, q, e } = await searchParams;
  const esc = q?.trim().slice(0, 80).replace(/[\\%_]/g, "\\$&");
  const where = and(
    statut && (STATUSES as readonly string[]).includes(statut) ? eq(r.status, statut as (typeof STATUSES)[number]) : undefined,
    esc ? or(ilike(r.ref, `%${esc}%`), ilike(r.lastName, `%${esc}%`), ilike(r.firstName, `%${esc}%`)) : undefined,
  );
  const rows = await db.select().from(r).where(where).orderBy(desc(r.createdAt)).limit(200);
  return (
    <>
      <Title action={<form action={purgeExpiredAction}><button className={btnOutline}>Purger les demandes expirées</button></form>}>Demandes de rendez-vous</Title>
      <Flash code={e} />
      <form className="mb-5 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Référence ou nom" aria-label="Rechercher" className={`${field} !mt-0 max-w-xs`} />
        <select name="statut" defaultValue={statut ?? ""} aria-label="Statut" className={`${field} !mt-0 max-w-[200px]`}>
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
        </select>
        <button className={btnOutline}>Filtrer</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left">
          <thead className="bg-mist"><tr>{["Référence", "Demandeur", "Type", "Créneau souhaité", "Reçue le", "Statut"].map((h) => (<th key={h} className="px-4 py-3 font-semibold">{h}</th>))}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center">Aucune demande.</td></tr>}
            {rows.map((x) => (
              <tr key={x.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-sm"><Link className="font-semibold text-turq-text underline" href={`/admin/demandes/${x.id}`}>{x.ref}</Link></td>
                <td className="px-4 py-3">{x.firstName} {x.lastName}</td>
                <td className="px-4 py-3">{TYPE[x.type]}</td>
                <td className="px-4 py-3">{x.preferredDate ?? "—"}{x.preferredSlot && x.preferredSlot !== "indifferent" ? ` (${x.preferredSlot === "matin" ? "matin" : "après-midi"})` : ""}</td>
                <td className="px-4 py-3">{dt(x.createdAt)}</td>
                <td className="px-4 py-3"><StatusPill status={x.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
