import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { decryptSecret, otpauthUri } from "@/lib/totp";
import { changeOwnPasswordAction, confirmTotpAction, disableTotpAction, startTotpAction } from "../../actions";
import { btn, btnDanger, btnOutline, card, field, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const me = await requireUser();
  const [{ e }, [u]] = await Promise.all([searchParams, db.select().from(users).where(eq(users.id, me.id)).limit(1)]);
  const pending = u.totpSecret && !u.totpEnabled;
  let qr = "", secret = "";
  if (pending) {
    secret = decryptSecret(u.totpSecret!);
    qr = await QRCode.toString(otpauthUri(secret, me.email), { type: "svg", margin: 1, width: 200 });
  }
  return (
    <>
      <Title>Mon compte et sécurité</Title>
      <Flash code={e} />
      <div className="grid max-w-2xl gap-6">
        <section className={card}>
          <h2 className="text-xl">Double authentification (2FA)</h2>
          {u.totpEnabled ? (
            <>
              <p className="mt-2">✔ Activée. Un code de votre application d&apos;authentification est demandé à chaque connexion.</p>
              <form action={disableTotpAction} className="mt-4 flex items-end gap-3">
                <div><label htmlFor="d-code" className="font-semibold">Code actuel pour désactiver</label><input id="d-code" name="code" inputMode="numeric" maxLength={10} required className={field} /></div>
                <button className={btnDanger}>Désactiver</button>
              </form>
            </>
          ) : pending ? (
            <>
              <p className="mt-2">1. Scannez ce QR code avec une application d&apos;authentification (Google Authenticator, Aegis, FreeOTP…).</p>
              <div className="my-3 w-[200px] bg-white" dangerouslySetInnerHTML={{ __html: qr }} />
              <p className="text-sm">Saisie manuelle : <code className="break-all">{secret}</code></p>
              <form action={confirmTotpAction} className="mt-4 flex items-end gap-3">
                <div><label htmlFor="code" className="font-semibold">2. Saisissez le code à 6 chiffres</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} required className={field} /></div>
                <button className={btn}>Activer</button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-2">Non activée. Recommandé pour tous les comptes ayant accès aux demandes de rendez-vous.</p>
              <form action={startTotpAction} className="mt-4"><button className={btn}>Activer la double authentification</button></form>
            </>
          )}
        </section>
        <section className={card}>
          <h2 className="text-xl">Changer mon mot de passe</h2>
          <form action={changeOwnPasswordAction} className="mt-3 grid gap-3">
            <div><label htmlFor="current" className="font-semibold">Mot de passe actuel</label><input id="current" name="current" type="password" required autoComplete="current-password" className={field} /></div>
            <div><label htmlFor="password" className="font-semibold">Nouveau (12 caractères minimum)</label><input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className={field} /></div>
            <div><label htmlFor="confirm" className="font-semibold">Confirmation</label><input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={field} /></div>
            <div><button className={btnOutline}>Changer le mot de passe</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
