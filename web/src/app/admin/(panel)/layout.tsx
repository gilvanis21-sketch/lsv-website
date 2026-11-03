import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABELS, type Permission } from "@/lib/permissions";
import { logoutAction } from "../actions";

const ITEMS: { href: string; label: string; perm: Permission }[] = [
  { href: "/admin/demandes", label: "Demandes", perm: "requests" },
  { href: "/admin/articles", label: "Articles", perm: "content" },
  { href: "/admin/categories", label: "Catégories", perm: "content" },
  { href: "/admin/services", label: "Services", perm: "content" },
  { href: "/admin/parametres", label: "Paramètres du site", perm: "settings" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", perm: "users" },
  { href: "/admin/journal", label: "Journal", perm: "audit" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
      <aside className="bg-petrol-dark p-5 text-[#cfe3e7]">
        <Link href="/admin" className="font-display text-xl font-extrabold text-white">LSV Admin</Link>
        <nav aria-label="Administration" className="mt-6 grid gap-1">
          {ITEMS.filter((i) => can(user.role, i.perm)).map((i) => (<Link key={i.href} href={i.href} className="rounded px-2 py-1.5 hover:bg-white/10 hover:text-white">{i.label}</Link>))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4 text-sm">
          <p className="text-white">{user.name}</p>
          <p>{ROLE_LABELS[user.role]}</p>
          <Link href="/admin/securite" className="mt-2 block underline hover:text-white">Mon compte / sécurité</Link>
          <form action={logoutAction} className="mt-3"><button className="underline hover:text-white">Se déconnecter</button></form>
          <Link href="/" className="mt-3 block underline hover:text-white">Voir le site</Link>
        </div>
      </aside>
      <main className="min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
