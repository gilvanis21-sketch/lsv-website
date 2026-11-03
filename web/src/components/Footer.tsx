import Link from "next/link";
import { FOOTER_LINKS, NAV, SITE } from "@/lib/site";
import { Tbd } from "@/components/ui";

export function Footer({ settings }: { settings: Partial<Record<string, string>> }) {
  const lines = [settings.address, settings.phone, settings.contact_email].filter(Boolean);
  return (
    <footer className="bg-petrol-dark text-[15px] text-[#cfe3e7]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-white">{SITE.short}</p>
          <p className="mt-2">{SITE.name}</p>
          <div className="mt-4 whitespace-pre-line">{lines.length ? lines.join("\n") : <>Adresse, téléphone, e-mail : <Tbd /></>}</div>
        </div>
        <nav aria-label="Pied de page : site">
          <p className="font-semibold text-white">Le site</p>
          <ul className="mt-2 grid gap-1">{NAV.map((n) => (<li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>))}</ul>
        </nav>
        <nav aria-label="Pied de page : informations">
          <p className="font-semibold text-white">Informations</p>
          <ul className="mt-2 grid gap-1">{FOOTER_LINKS.map((n) => (<li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>))}</ul>
        </nav>
      </div>
      <p className="border-t border-white/10 px-6 py-4 text-center text-sm">© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}
