import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, sessions, users } from "@/db";
import { can, type Permission, type Role } from "./permissions";
import { isHttps } from "./request-info";
import { decryptSecret, verifyTotp } from "./totp";

// HTTPS : cookie « __Host- » + Secure. HTTP (essai local sur localhost) : cookie simple, sinon le navigateur le refuserait.
const cookieName = async () => ((await isHttps()) ? "__Host-lsv_session" : "lsv_session");
const SESSION_HOURS = 8;
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

// Argon2id (valeurs par défaut de @node-rs/argon2 = Argon2id, m=19 Mio, t=2).
export const hashPassword = (pw: string) => hash(pw);
const DUMMY_HASH_PROMISE = hash("mot-de-passe-factice-pour-temps-constant");

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export type SessionUser = { id: string; email: string; name: string; role: Role };

export async function login(email: string, password: string, code = ""): Promise<{ ok: true; user: SessionUser } | { ok: false; reason: "invalid" | "locked" }> {
  const [u] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  // Vérification toujours exécutée : temps de réponse identique que le compte existe ou non.
  const valid = await verify(u?.passwordHash ?? (await DUMMY_HASH_PROMISE), password).catch(() => false);
  if (!u || !u.active) return { ok: false, reason: "invalid" };
  if (u.lockedUntil && u.lockedUntil > new Date()) return { ok: false, reason: "locked" };
  if (!valid) {
    const fails = u.failedAttempts + 1;
    await db.update(users).set(fails >= MAX_FAILS ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } : { failedAttempts: fails }).where(eq(users.id, u.id));
    return { ok: false, reason: fails >= MAX_FAILS ? "locked" : "invalid" };
  }
  // Double authentification : si activée, le code est exigé. Échec = même message générique + compte au verrouillage.
  if (u.totpEnabled && u.totpSecret) {
    const step = verifyTotp(decryptSecret(u.totpSecret), code.trim(), u.totpLastStep);
    if (step === null) {
      const fails = u.failedAttempts + 1;
      await db.update(users).set(fails >= MAX_FAILS ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } : { failedAttempts: fails }).where(eq(users.id, u.id));
      return { ok: false, reason: fails >= MAX_FAILS ? "locked" : "invalid" };
    }
    await db.update(users).set({ totpLastStep: step }).where(eq(users.id, u.id));
  }
  await db.update(users).set({ failedAttempts: 0, lockedUntil: null }).where(eq(users.id, u.id));
  await createSession(u.id);
  return { ok: true, user: { id: u.id, email: u.email, name: u.name, role: u.role } };
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt });
  const https = await isHttps();
  (await cookies()).set(await cookieName(), token, { httpOnly: true, secure: https, sameSite: "strict", path: "/", expires: expiresAt });
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(await cookieName())?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, active: users.active })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row && row.active ? { id: row.id, email: row.email, name: row.name, role: row.role } : null;
});

export async function logout() {
  const c = await cookies();
  const name = await cookieName();
  const token = c.get(name)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  c.delete(name);
}

export async function revokeUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** À appeler au début de CHAQUE page et CHAQUE action admin (un layout seul ne protège pas les actions). */
export async function requirePermission(p: Permission): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  if (!can(user.role, p)) redirect("/admin?refuse=1");
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
