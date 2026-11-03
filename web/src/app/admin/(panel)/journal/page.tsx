import { desc } from "drizzle-orm";
import { auditLog, db } from "@/db";
import { requirePermission } from "@/lib/auth";
import { dt, Title } from "../../ui";

export default async function Page() {
  await requirePermission("audit");
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
  return (
    <>
      <Title>Journal d&apos;audit</Title>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm"><thead className="bg-mist"><tr>{["Date", "Action", "Acteur", "Cible", "Détail", "IP (pseudonymisée)"].map((h) => (<th key={h} className="px-3 py-2">{h}</th>))}</tr></thead>
          <tbody>{rows.map((r) => (<tr key={r.id} className="border-t border-line"><td className="px-3 py-2">{dt(r.createdAt)}</td><td className="px-3 py-2 font-mono">{r.action}</td><td className="px-3 py-2">{r.actorLabel ?? "—"}</td><td className="px-3 py-2">{r.target ?? ""}</td><td className="px-3 py-2">{r.detail ?? ""}</td><td className="px-3 py-2 font-mono">{r.ipHash?.slice(0, 8)}</td></tr>))}</tbody></table>
      </div>
    </>
  );
}
