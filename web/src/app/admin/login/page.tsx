import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { loginAction } from "../actions";
import { btn, field } from "../ui";

const MSG: Record<string, string> = {
  invalid: "Identifiants incorrects.",
  locked: "Compte temporairement verrouillé. Réessayez dans 15 minutes.",
  rate: "Trop de tentatives. Réessayez plus tard.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await getUser()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={loginAction} className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl">Administration LSV</h1>
        {e && MSG[e] && <p role="alert" className="mt-4 rounded-md bg-[#fdeceb] px-3 py-2 text-[#8c1d18]">{MSG[e]}</p>}
        <label className="mt-5 block font-semibold" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" maxLength={254} className={field} />
        <label className="mt-4 block font-semibold" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" maxLength={200} className={field} />
        <label className="mt-4 block font-semibold" htmlFor="code">Code à 6 chiffres <span className="font-normal">(si la double authentification est activée)</span></label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} className={field} />
        <button className={`${btn} mt-6 w-full`}>Se connecter</button>
      </form>
    </main>
  );
}
