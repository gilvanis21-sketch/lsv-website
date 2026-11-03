import { asc } from "drizzle-orm";
import { db, users } from "@/db";
import { requirePermission } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import { createUserAction, resetPasswordAction, resetTotpAction, updateUserAction } from "../../actions";
import { btn, btnOutline, card, field, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("users");
  const [{ e }, rows] = await Promise.all([searchParams, db.select().from(users).orderBy(asc(users.email))]);
  return (
    <>
      <Title>Utilisateurs et rôles</Title>
      <Flash code={e} />
      <form action={createUserAction} className={`${card} mb-8 grid max-w-3xl gap-4 sm:grid-cols-2`}>
        <h2 className="text-xl sm:col-span-2">Nouvel utilisateur</h2>
        <div><label htmlFor="name" className="font-semibold">Nom</label><input id="name" name="name" required maxLength={100} className={field} /></div>
        <div><label htmlFor="email" className="font-semibold">E-mail</label><input id="email" name="email" type="email" required maxLength={254} className={field} /></div>
        <div><label htmlFor="role" className="font-semibold">Rôle</label><select id="role" name="role" className={field} defaultValue="secretary">{Object.entries(ROLE_LABELS).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select></div>
        <div><label htmlFor="password" className="font-semibold">Mot de passe initial (12 car. min.)</label><input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={field} /></div>
        <div className="sm:col-span-2"><button className={btn}>Créer</button></div>
      </form>
      <div className="grid max-w-3xl gap-4">
        {rows.map((u) => (
          <div key={u.id} className={card}>
            <p className="font-semibold">{u.name} <span className="font-normal">· {u.email}</span>{!u.active && <em> (désactivé)</em>}{u.totpEnabled && <span> · 2FA activée</span>}</p>
            <form action={updateUserAction} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={u.id} />
              <select name="role" defaultValue={u.role} aria-label={`Rôle de ${u.name}`} className={`${field} !mt-0 max-w-[200px]`}>{Object.entries(ROLE_LABELS).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}</select>
              <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={u.active} /> Actif</label>
              <button className={btnOutline}>Mettre à jour</button>
            </form>
            <form action={resetPasswordAction} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={u.id} />
              <input name="password" type="password" minLength={12} required placeholder="Nouveau mot de passe" autoComplete="new-password" aria-label={`Nouveau mot de passe pour ${u.name}`} className={`${field} !mt-0 max-w-[260px]`} />
              <button className={btnOutline}>Réinitialiser</button>
            </form>
            {u.totpEnabled && (<form action={resetTotpAction} className="mt-3"><input type="hidden" name="id" value={u.id} /><button className={btnOutline}>Réinitialiser la double authentification</button></form>)}
          </div>
        ))}
      </div>
    </>
  );
}
