"use server";

import { and, count, eq, ne, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appointmentRequests, categories, db, posts, services, siteSettings, users } from "@/db";
import { audit } from "@/lib/audit";
import { hashPassword, login, logout, requirePermission, requireUser, revokeUserSessions } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request-info";
import { SETTING_KEYS } from "@/lib/queries";
import { saveImage } from "@/lib/uploads";
import { decryptSecret, encryptSecret, newSecret, verifyTotp } from "@/lib/totp";
import { loginSchema, passwordSchema, slugify } from "@/lib/validation";

const isUnique = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
const str = (f: FormData, k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string).trim() : "");
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 30);
const uuid = z.uuid();

// ───────────────────────── Authentification ─────────────────────────

export async function loginAction(formData: FormData) {
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) redirect("/admin/login?e=rate");
  const parsed = loginSchema.safeParse({ email: str(formData, "email"), password: String(formData.get("password") ?? ""), code: str(formData, "code").replace(/\s/g, "") });
  if (!parsed.success) redirect("/admin/login?e=invalid");
  const res = await login(parsed.data.email, parsed.data.password, parsed.data.code);
  if (!res.ok) {
    await audit(res.reason === "locked" ? "auth.compte_verrouille" : "auth.echec", { actorLabel: parsed.data.email });
    redirect(`/admin/login?e=${res.reason === "locked" ? "locked" : "invalid"}`);
  }
  await audit("auth.connexion", { actorId: res.user.id, actorLabel: res.user.email });
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ───────────────────────── Demandes de rendez-vous ─────────────────────────

const STATUSES = ["nouvelle", "en_attente", "confirmee", "refusee", "traitee"] as const;

export async function updateRequestAction(formData: FormData) {
  const user = await requirePermission("requests");
  const id = uuid.safeParse(str(formData, "id"));
  const status = z.enum(STATUSES).safeParse(str(formData, "status"));
  if (!id.success || !status.success) redirect("/admin/demandes?e=invalid");
  const notes = str(formData, "notes").slice(0, 2000);
  const [row] = await db.update(appointmentRequests).set({ status: status.data, internalNotes: notes || null, updatedAt: new Date() }).where(eq(appointmentRequests.id, id.data)).returning({ ref: appointmentRequests.ref });
  await audit("demande.statut", { actorId: user.id, actorLabel: user.email, target: row?.ref, detail: status.data });
  redirect(`/admin/demandes/${id.data}?e=saved`);
}

export async function deleteRequestAction(formData: FormData) {
  const user = await requirePermission("requests");
  const id = uuid.safeParse(str(formData, "id"));
  if (!id.success || formData.get("confirm") !== "on") redirect("/admin/demandes?e=invalid");
  const [row] = await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id.data)).returning({ ref: appointmentRequests.ref });
  await audit("demande.suppression", { actorId: user.id, actorLabel: user.email, target: row?.ref });
  redirect("/admin/demandes?e=deleted");
}

export async function purgeExpiredAction() {
  const user = await requirePermission("requests");
  const rows = await db.delete(appointmentRequests).where(lt(appointmentRequests.purgeAt, new Date())).returning({ id: appointmentRequests.id });
  await audit("demande.purge", { actorId: user.id, actorLabel: user.email, detail: `${rows.length} supprimée(s)` });
  redirect("/admin/demandes?e=deleted");
}

// ───────────────────────── Blog ─────────────────────────

export async function savePostAction(formData: FormData) {
  const user = await requirePermission("content");
  const rawId = str(formData, "id");
  const id = rawId ? uuid.safeParse(rawId) : null;
  if (id && !id.success) redirect("/admin/articles?e=invalid");
  const title = str(formData, "title").slice(0, 200);
  if (!title) redirect(rawId ? `/admin/articles/${rawId}?e=invalid` : "/admin/articles/nouveau?e=invalid");
  const back = (code: string) => redirect(rawId ? `/admin/articles/${rawId}?e=${code}` : `/admin/articles/nouveau?e=${code}`);
  const slug = slugify(str(formData, "slug") || title);
  if (!slug) back("invalid");
  const status = str(formData, "status") === "publie" ? "publie" : "brouillon";
  const dateRaw = str(formData, "publishedAt");
  let publishedAt: Date | null = dateRaw ? new Date(dateRaw) : null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) back("invalid");
  if (status === "publie" && !publishedAt) publishedAt = new Date();
  const catRaw = str(formData, "categoryId");
  const categoryId = catRaw && uuid.safeParse(catRaw).success ? catRaw : null;

  const values: Partial<typeof posts.$inferInsert> = { title, slug, excerpt: str(formData, "excerpt").slice(0, 400), body: str(formData, "body").slice(0, 50_000), status, publishedAt, categoryId, imageAlt: str(formData, "imageAlt").slice(0, 200) || null, updatedAt: new Date() };
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try { values.imagePath = await saveImage(file); } catch { back("image"); }
  } else if (formData.get("removeImage") === "on") values.imagePath = null;

  let savedId: string;
  try {
    if (id?.success) {
      await db.update(posts).set(values).where(eq(posts.id, id.data));
      savedId = id.data;
    } else {
      const [r] = await db.insert(posts).values({ ...(values as typeof posts.$inferInsert), authorId: user.id }).returning({ id: posts.id });
      savedId = r.id;
    }
  } catch (e) {
    if (isUnique(e)) back("slug");
    throw e;
  }
  await audit(id ? "article.modification" : "article.creation", { actorId: user.id, actorLabel: user.email, target: slug });
  revalidatePath("/actualites");
  redirect(`/admin/articles/${savedId!}?e=saved`);
}

export async function deletePostAction(formData: FormData) {
  const user = await requirePermission("content");
  const id = uuid.safeParse(str(formData, "id"));
  if (!id.success) redirect("/admin/articles?e=invalid");
  const [r] = await db.delete(posts).where(eq(posts.id, id.data)).returning({ slug: posts.slug });
  await audit("article.suppression", { actorId: user.id, actorLabel: user.email, target: r?.slug });
  revalidatePath("/actualites");
  redirect("/admin/articles?e=deleted");
}

export async function saveCategoryAction(formData: FormData) {
  const user = await requirePermission("content");
  const name = str(formData, "name").slice(0, 80);
  const slug = slugify(name);
  if (!name || !slug) redirect("/admin/categories?e=invalid");
  try { await db.insert(categories).values({ name, slug }); } catch (e) { if (isUnique(e)) redirect("/admin/categories?e=slug"); throw e; }
  await audit("categorie.creation", { actorId: user.id, actorLabel: user.email, target: slug });
  redirect("/admin/categories?e=saved");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requirePermission("content");
  const id = uuid.safeParse(str(formData, "id"));
  if (!id.success) redirect("/admin/categories?e=invalid");
  await db.delete(categories).where(eq(categories.id, id.data));
  await audit("categorie.suppression", { actorId: user.id, actorLabel: user.email, target: id.data });
  redirect("/admin/categories?e=deleted");
}

// ───────────────────────── Services ─────────────────────────

export async function saveServiceAction(formData: FormData) {
  const user = await requirePermission("content");
  const rawId = str(formData, "id");
  const id = rawId ? uuid.safeParse(rawId) : null;
  if (id && !id.success) redirect("/admin/services?e=invalid");
  const back = (code: string) => redirect(rawId ? `/admin/services/${rawId}?e=${code}` : `/admin/services/nouveau?e=${code}`);
  const title = str(formData, "title").slice(0, 120);
  const summary = str(formData, "summary").slice(0, 300);
  const slug = slugify(str(formData, "slug") || title);
  if (!title || !summary || !slug) back("invalid");
  const position = Number.parseInt(str(formData, "position") || "0", 10);
  const values = { title, summary, slug, description: str(formData, "description").slice(0, 10_000), objectives: lines(str(formData, "objectives")), process: lines(str(formData, "process")), practical: lines(str(formData, "practical")), price: str(formData, "price").slice(0, 120) || null, position: Number.isFinite(position) ? position : 0, published: formData.get("published") === "on" };
  let savedId: string;
  try {
    if (id?.success) { await db.update(services).set(values).where(eq(services.id, id.data)); savedId = id.data; }
    else { const [r] = await db.insert(services).values(values).returning({ id: services.id }); savedId = r.id; }
  } catch (e) { if (isUnique(e)) back("slug"); throw e; }
  await audit(id ? "service.modification" : "service.creation", { actorId: user.id, actorLabel: user.email, target: slug });
  revalidatePath("/nos-services");
  redirect(`/admin/services/${savedId!}?e=saved`);
}

export async function deleteServiceAction(formData: FormData) {
  const user = await requirePermission("content");
  const id = uuid.safeParse(str(formData, "id"));
  if (!id.success) redirect("/admin/services?e=invalid");
  const [r] = await db.delete(services).where(eq(services.id, id.data)).returning({ slug: services.slug });
  await audit("service.suppression", { actorId: user.id, actorLabel: user.email, target: r?.slug });
  revalidatePath("/nos-services");
  redirect("/admin/services?e=deleted");
}

// ───────────────────────── Paramètres du site ─────────────────────────

export async function saveSettingsAction(formData: FormData) {
  const user = await requirePermission("settings");
  for (const key of Object.keys(SETTING_KEYS)) {
    const value = str(formData, key).slice(0, 2000);
    if (value) await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value } });
    else await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }
  await audit("parametres.modification", { actorId: user.id, actorLabel: user.email });
  revalidatePath("/", "layout");
  redirect("/admin/parametres?e=saved");
}

// ───────────────────────── Utilisateurs & rôles ─────────────────────────

const ROLES = ["admin", "editor", "secretary"] as const;

async function otherActiveAdmins(excludeId: string) {
  const [r] = await db.select({ n: count() }).from(users).where(and(eq(users.role, "admin"), eq(users.active, true), ne(users.id, excludeId)));
  return r.n;
}

export async function createUserAction(formData: FormData) {
  const me = await requirePermission("users");
  const email = z.email().max(254).safeParse(str(formData, "email").toLowerCase());
  const role = z.enum(ROLES).safeParse(str(formData, "role"));
  const pw = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  const name = str(formData, "name").slice(0, 100);
  if (!email.success || !role.success || !name) redirect("/admin/utilisateurs?e=invalid");
  if (!pw.success) redirect("/admin/utilisateurs?e=password");
  try { await db.insert(users).values({ email: email.data, name, role: role.data, passwordHash: await hashPassword(pw.data) }); }
  catch (e) { if (isUnique(e)) redirect("/admin/utilisateurs?e=exists"); throw e; }
  await audit("utilisateur.creation", { actorId: me.id, actorLabel: me.email, target: email.data, detail: role.data });
  redirect("/admin/utilisateurs?e=saved");
}

export async function updateUserAction(formData: FormData) {
  const me = await requirePermission("users");
  const id = uuid.safeParse(str(formData, "id"));
  const role = z.enum(ROLES).safeParse(str(formData, "role"));
  if (!id.success || !role.success) redirect("/admin/utilisateurs?e=invalid");
  const active = formData.get("active") === "on";
  const [target] = await db.select().from(users).where(eq(users.id, id.data)).limit(1);
  if (!target) redirect("/admin/utilisateurs?e=invalid");
  if (target.id === me.id && (role.data !== target.role || !active)) redirect("/admin/utilisateurs?e=self");
  if (target.role === "admin" && (role.data !== "admin" || !active) && (await otherActiveAdmins(target.id)) === 0) redirect("/admin/utilisateurs?e=last_admin");
  await db.update(users).set({ role: role.data, active }).where(eq(users.id, id.data));
  if (!active || role.data !== target.role) await revokeUserSessions(id.data);
  await audit("utilisateur.modification", { actorId: me.id, actorLabel: me.email, target: target.email, detail: `${role.data}${active ? "" : " (désactivé)"}` });
  redirect("/admin/utilisateurs?e=saved");
}

export async function resetPasswordAction(formData: FormData) {
  const me = await requirePermission("users");
  const id = uuid.safeParse(str(formData, "id"));
  const pw = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!id.success) redirect("/admin/utilisateurs?e=invalid");
  if (!pw.success) redirect("/admin/utilisateurs?e=password");
  const [t] = await db.update(users).set({ passwordHash: await hashPassword(pw.data), failedAttempts: 0, lockedUntil: null }).where(eq(users.id, id.data)).returning({ email: users.email });
  await revokeUserSessions(id.data);
  await audit("utilisateur.mot_de_passe", { actorId: me.id, actorLabel: me.email, target: t?.email });
  redirect("/admin/utilisateurs?e=saved");
}

// ───────────────────────── Double authentification (TOTP) ─────────────────────────

export async function startTotpAction() {
  const me = await requireUser();
  await db.update(users).set({ totpSecret: encryptSecret(newSecret()), totpEnabled: false, totpLastStep: 0 }).where(eq(users.id, me.id));
  redirect("/admin/securite");
}

export async function confirmTotpAction(formData: FormData) {
  const me = await requireUser();
  const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  if (!u?.totpSecret) redirect("/admin/securite?e=invalid");
  const step = verifyTotp(decryptSecret(u.totpSecret), str(formData, "code").replace(/\s/g, ""), 0);
  if (step === null) redirect("/admin/securite?e=totp");
  await db.update(users).set({ totpEnabled: true, totpLastStep: step }).where(eq(users.id, me.id));
  await audit("auth.totp_active", { actorId: me.id, actorLabel: me.email });
  redirect("/admin/securite?e=saved");
}

export async function disableTotpAction(formData: FormData) {
  const me = await requireUser();
  const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  if (!u?.totpSecret || verifyTotp(decryptSecret(u.totpSecret), str(formData, "code").replace(/\s/g, ""), u.totpLastStep) === null) redirect("/admin/securite?e=totp");
  await db.update(users).set({ totpEnabled: false, totpSecret: null, totpLastStep: 0 }).where(eq(users.id, me.id));
  await audit("auth.totp_desactive", { actorId: me.id, actorLabel: me.email });
  redirect("/admin/securite?e=saved");
}

/** Un administrateur peut réinitialiser la 2FA d'un collègue (téléphone perdu). */
export async function resetTotpAction(formData: FormData) {
  const me = await requirePermission("users");
  const id = uuid.safeParse(str(formData, "id"));
  if (!id.success) redirect("/admin/utilisateurs?e=invalid");
  const [t] = await db.update(users).set({ totpEnabled: false, totpSecret: null, totpLastStep: 0 }).where(eq(users.id, id.data)).returning({ email: users.email });
  await revokeUserSessions(id.data);
  await audit("utilisateur.totp_reinitialise", { actorId: me.id, actorLabel: me.email, target: t?.email });
  redirect("/admin/utilisateurs?e=saved");
}

export async function changeOwnPasswordAction(formData: FormData) {
  const me = await requireUser();
  const pw = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!pw.success || formData.get("password") !== formData.get("confirm")) redirect("/admin/securite?e=password");
  const [u] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
  const { verify } = await import("@node-rs/argon2");
  if (!u || !(await verify(u.passwordHash, String(formData.get("current") ?? "")).catch(() => false))) redirect("/admin/securite?e=password");
  await db.update(users).set({ passwordHash: await hashPassword(pw.data) }).where(eq(users.id, me.id));
  await audit("utilisateur.mot_de_passe_propre", { actorId: me.id, actorLabel: me.email });
  redirect("/admin/securite?e=saved");
}
