import { deleteServiceAction, saveServiceAction } from "../../actions";
import { btn, btnDanger, card, field } from "../../ui";

type S = { id: string; title: string; slug: string; summary: string; description: string; objectives: string[]; process: string[]; practical: string[]; price: string | null; position: number; published: boolean };

export function ServiceForm({ s }: { s?: S }) {
  return (
    <div className="grid gap-6">
      <form action={saveServiceAction} className={`${card} grid max-w-3xl gap-4`}>
        {s && <input type="hidden" name="id" value={s.id} />}
        <div><label htmlFor="title" className="font-semibold">Titre *</label><input id="title" name="title" required maxLength={120} defaultValue={s?.title} className={field} /></div>
        <div><label htmlFor="slug" className="font-semibold">Lien (slug)</label><input id="slug" name="slug" maxLength={80} defaultValue={s?.slug} className={field} /></div>
        <div><label htmlFor="summary" className="font-semibold">Résumé *</label><input id="summary" name="summary" required maxLength={300} defaultValue={s?.summary} className={field} /></div>
        <div><label htmlFor="description" className="font-semibold">Description</label><textarea id="description" name="description" rows={5} defaultValue={s?.description} className={field} /></div>
        {([["objectives", "Objectifs", s?.objectives], ["process", "Déroulement", s?.process], ["practical", "Informations pratiques", s?.practical]] as const).map(([k, l, v]) => (
          <div key={k}><label htmlFor={k} className="font-semibold">{l} (une ligne par élément)</label><textarea id={k} name={k} rows={4} defaultValue={v?.join("\n")} className={field} /></div>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="price" className="font-semibold">Tarif (laisser vide s&apos;il n&apos;est pas communiqué)</label><input id="price" name="price" maxLength={120} defaultValue={s?.price ?? ""} className={field} /></div>
          <div><label htmlFor="position" className="font-semibold">Ordre d&apos;affichage</label><input id="position" name="position" type="number" defaultValue={s?.position ?? 0} className={field} /></div>
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={s?.published ?? true} /> Publié sur le site</label>
        <div><button className={btn}>Enregistrer</button></div>
      </form>
      {s && (<form action={deleteServiceAction} className={`${card} max-w-3xl`}><input type="hidden" name="id" value={s.id} /><button className={btnDanger}>Supprimer le service</button></form>)}
    </div>
  );
}
