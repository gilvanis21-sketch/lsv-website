"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, SITE } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-petrol focus:px-3 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-wide text-petrol" aria-label={`${SITE.short} — ${SITE.name}, accueil`}>
          {SITE.short}
        </Link>
        <nav aria-label="Navigation principale" className="ml-4 hidden gap-5 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`text-[15px] hover:text-turq-text ${isActive(n.href) ? "font-semibold text-petrol underline decoration-turq decoration-2 underline-offset-8" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/contact" className="hidden rounded-lg bg-petrol px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-petrol-dark sm:inline-block">
            Prendre rendez-vous
          </Link>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Fermer" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-line bg-white px-6 py-4 lg:hidden">
          <ul className="grid gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined} className="block rounded py-2 font-medium">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-petrol px-4 py-3 text-center font-semibold text-white">
                Prendre rendez-vous
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
