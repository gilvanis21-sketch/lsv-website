import { savePostAction, deletePostAction } from "../../actions";
import { btn, btnDanger, card, field } from "../../ui";

type Post = { id: string; title: string; slug: string; excerpt: string; body: string; status: "brouillon" | "publie"; publishedAt: Date | null; categoryId: string | null; imagePath: string | null; imageAlt: string | null };
const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function PostForm({ post, categories }: { post?: Post; categories: { id: string; name: string }[] }) {
  return (
    <div className="grid gap-6">
      <form action={savePostAction} encType="multipart/form-data" className={`${card} grid max-w-3xl gap-4`}>
        {post && <input type="hidden" name="id" value={post.id} />}
        <div><label htmlFor="title" className="font-semibold">Titre *</label><input id="title" name="title" required maxLength={200} defaultValue={post?.title} className={field} /></div>
        <div><label htmlFor="slug" className="font-semibold">Lien (slug)</label><input id="slug" name="slug" maxLength={80} defaultValue={post?.slug} placeholder="généré depuis le titre" className={field} /></div>
        <div><label htmlFor="excerpt" className="font-semibold">Résumé</label><textarea id="excerpt" name="excerpt" rows={2} maxLength={400} defaultValue={post?.excerpt} className={field} /></div>
        <div><label htmlFor="body" className="font-semibold">Contenu</label><textarea id="body" name="body" rows={14} maxLength={50000} defaultValue={post?.body} className={field} /><p className="mt-1 text-sm">Texte brut : séparez les paragraphes par une ligne vide.</p></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label htmlFor="categoryId" className="font-semibold">Catégorie</label><select id="categoryId" name="categoryId" defaultValue={post?.categoryId ?? ""} className={field}><option value="">Aucune</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
          <div><label htmlFor="status" className="font-semibold">Statut</label><select id="status" name="status" defaultValue={post?.status ?? "brouillon"} className={field}><option value="brouillon">Brouillon</option><option value="publie">Publié</option></select></div>
          <div><label htmlFor="publishedAt" className="font-semibold">Date de publication</label><input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={local(post?.publishedAt ?? null)} className={field} /></div>
        </div>
        <p className="-mt-2 text-sm">Une date future programme la publication.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="image" className="font-semibold">Image (JPEG, PNG, WebP, 3 Mo max)</label><input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className={field} />{post?.imagePath && <label className="mt-2 flex items-center gap-2"><input type="checkbox" name="removeImage" /> Retirer l&apos;image actuelle</label>}</div>
          <div><label htmlFor="imageAlt" className="font-semibold">Texte alternatif de l&apos;image</label><input id="imageAlt" name="imageAlt" maxLength={200} defaultValue={post?.imageAlt ?? ""} className={field} /></div>
        </div>
        <div><button className={btn}>Enregistrer</button></div>
      </form>
      {post && (
        <form action={deletePostAction} className={`${card} max-w-3xl`}>
          <input type="hidden" name="id" value={post.id} />
          <button className={btnDanger}>Supprimer l&apos;article</button>
        </form>
      )}
    </div>
  );
}
