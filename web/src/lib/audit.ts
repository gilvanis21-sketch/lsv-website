import { db, auditLog } from "@/db";
import { clientIp, hashIp } from "./request-info";

export async function audit(action: string, opts: { actorId?: string | null; actorLabel?: string; target?: string; detail?: string } = {}) {
  try {
    await db.insert(auditLog).values({
      action,
      actorId: opts.actorId ?? null,
      actorLabel: opts.actorLabel ?? null,
      target: opts.target ?? null,
      detail: opts.detail?.slice(0, 500) ?? null,
      ipHash: hashIp(await clientIp()),
    });
  } catch (e) {
    console.error("[audit] échec d'écriture", e instanceof Error ? e.message : e);
  }
}
