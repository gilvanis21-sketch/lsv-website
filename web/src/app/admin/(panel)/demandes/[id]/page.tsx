import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { appointmentRequests as r, db } from "@/db";
import { requirePermission } from "@/lib/auth";
import { deleteRequestAction, updateRequestAction } from "../../../actions";
import { btn, btnDanger, card, dt, field, Flash, STATUS_LABEL, StatusPill, Title } from "../../../ui";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  await requirePermission("requests");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [x] = await db.select().from(r).where(eq(r.id, id)).limit(1);
  if (!x) notFound();
  const { e } = await searchParams;
  const rows: [string, string][] = [
    ["Référence", x.ref], ["Nom", x.lastName], ["Prénom", x.firstName], ["E-mail", x.email], ["Téléphone", x.phone],
    ["Type", x.type === "suivi" ? "Suivi" : "Première consultation"],
    ["Créneau souhaité", `${x.preferredDate ?? "—"} ${x.preferredSlot ?? ""}`],
    ["Reçue le", dt(x.createdAt)], ["Consentement", `${dt(x.consentAt)} (version ${x.consentVersion})`], ["Suppression automatique prévue", dt(x.purgeAt)],
  ];
  return (
    <>
      <Title action={<Link href="/admin/demandes" className="underline">← Retour à la liste</Link>}>Demande {x.ref}</Title>
      <Flash code={e} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={card}>
          <p className="mb-3"><StatusPill status={x.status} /></p>
          <dl className="grid gap-2">{rows.map(([k, v]) => (<div key={k} className="grid grid-cols-[170px_1fr] gap-2"><dt className="font-semibold">{k}</dt><dd className="break-words">{v}</dd></div>))}</dl>
          <p className="mt-4"><a className="underline" href={`/admin/demandes/${x.id}/export`}>Exporter les données (JSON, droit d&apos;accès)</a></p>
        </div>
        <div className="grid content-start gap-6">
          <form action={updateRequestAction} className={card}>
            <input type="hidden" name="id" value={x.id} />
            <label htmlFor="status" className="font-semibold">Statut</label>
            <select id="status" name="status" defaultValue={x.status} className={field}>{Object.entries(STATUS_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select>
            <label htmlFor="notes" className="mt-4 block font-semibold">Notes internes</label>
            <textarea id="notes" name="notes" rows={5} maxLength={2000} defaultValue={x.internalNotes ?? ""} className={field} />
            <p className="mt-1 text-sm">Ne saisissez aucune information médicale détaillée.</p>
            <button className={`${btn} mt-4`}>Enregistrer</button>
          </form>
          <form action={deleteRequestAction} className={card}>
            <input type="hidden" name="id" value={x.id} />
            <p className="font-semibold">Suppression (droit à l&apos;effacement)</p>
            <label className="mt-2 flex items-center gap-2"><input type="checkbox" name="confirm" required /> Je confirme la suppression définitive</label>
            <button className={`${btnDanger} mt-3`}>Supprimer cette demande</button>
          </form>
        </div>
      </div>
    </>
  );
}
