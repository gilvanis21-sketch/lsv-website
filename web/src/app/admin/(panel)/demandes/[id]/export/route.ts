import { eq } from "drizzle-orm";
import { z } from "zod";
import { appointmentRequests as r, db } from "@/db";
import { audit } from "@/lib/audit";
import { getUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !can(user.role, "requests")) return new Response("Non autorisé", { status: 401 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response("Introuvable", { status: 404 });
  const [x] = await db.select().from(r).where(eq(r.id, id)).limit(1);
  if (!x) return new Response("Introuvable", { status: 404 });
  await audit("demande.export", { actorId: user.id, actorLabel: user.email, target: x.ref });
  return new Response(JSON.stringify(x, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${x.ref}.json"`, "Cache-Control": "no-store" } });
}
