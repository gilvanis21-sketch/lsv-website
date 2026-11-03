import { requirePermission } from "@/lib/auth";
import { getSettings, SETTING_KEYS } from "@/lib/queries";
import { saveSettingsAction } from "../../actions";
import { btn, card, field, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("settings");
  const [{ e }, s] = await Promise.all([searchParams, getSettings()]);
  return (
    <>
      <Title>Paramètres du site</Title>
      <Flash code={e} />
      <p className="mb-4 max-w-2xl">Ces informations s&apos;affichent sur la page « Informations pratiques » et dans le pied de page. Laissez un champ vide tant que l&apos;information n&apos;est pas validée.</p>
      <form action={saveSettingsAction} className={`${card} grid max-w-2xl gap-4`}>
        {Object.entries(SETTING_KEYS).map(([k, label]) => (<div key={k}><label htmlFor={k} className="font-semibold">{label}</label><textarea id={k} name={k} rows={k === "hours" || k === "address" ? 3 : 2} maxLength={2000} defaultValue={s[k] ?? ""} className={field} /></div>))}
        <div><button className={btn}>Enregistrer</button></div>
      </form>
    </>
  );
}
