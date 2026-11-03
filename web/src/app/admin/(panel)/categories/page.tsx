import { requirePermission } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { deleteCategoryAction, saveCategoryAction } from "../../actions";
import { btn, btnDanger, card, field, Flash, Title } from "../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const [{ e }, cats] = await Promise.all([searchParams, getCategories()]);
  return (
    <>
      <Title>Catégories</Title>
      <Flash code={e} />
      <form action={saveCategoryAction} className={`${card} mb-6 flex max-w-xl items-end gap-3`}>
        <div className="flex-1"><label htmlFor="name" className="font-semibold">Nouvelle catégorie</label><input id="name" name="name" required maxLength={80} className={field} /></div>
        <button className={btn}>Ajouter</button>
      </form>
      <ul className="grid max-w-xl gap-2">
        {cats.length === 0 && <li>Aucune catégorie.</li>}
        {cats.map((c) => (<li key={c.id} className={`${card} flex items-center justify-between`}><span>{c.name} <small className="text-[#4b6a73]">/{c.slug}</small></span><form action={deleteCategoryAction}><input type="hidden" name="id" value={c.id} /><button className={btnDanger}>Supprimer</button></form></li>))}
      </ul>
    </>
  );
}
