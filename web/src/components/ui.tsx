import Link from "next/link";
import type { ReactNode } from "react";
import { TBD } from "@/lib/content";

export function Tbd({ children }: { children?: ReactNode }) {
  return <mark className="rounded bg-amber-100 px-1 text-[0.9em] text-ink">{children ?? TBD}</mark>;
}

export function ButtonLink({ href, children, variant = "solid" }: { href: string; children: ReactNode; variant?: "solid" | "outline" | "light" }) {
  const base = "inline-block rounded-lg border-2 px-6 py-3 font-semibold transition-colors";
  const v = {
    solid: "border-petrol bg-petrol text-white hover:bg-petrol-dark",
    outline: "border-petrol bg-white text-petrol hover:bg-mist",
    light: "border-white bg-white text-petrol hover:bg-mist",
  }[variant];
  return <Link href={href} className={`${base} ${v}`}>{children}</Link>;
}

export function Section({ children, alt, className = "" }: { children: ReactNode; alt?: boolean; className?: string }) {
  return (
    <section className={`${alt ? "bg-mist" : ""} py-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}

export function PageHeader({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="border-b border-line bg-mist">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg">{lead}</p>}
      </div>
    </div>
  );
}

export function Card({ title, children, href }: { title: string; children: ReactNode; href?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-petrol/10">
      <h3 className="text-xl">{title}</h3>
      <div className="mt-2">{children}</div>
      {href && (
        <Link href={href} className="mt-4 inline-block font-semibold text-turq-text hover:underline">
          En savoir plus<span aria-hidden> →</span>
          <span className="sr-only"> : {title}</span>
        </Link>
      )}
    </div>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div role="img" aria-label={typeof children === "string" ? children : "Illustration provisoire"} className="grid min-h-60 place-items-center rounded-2xl bg-gradient-to-br from-[#dbe9ec] to-[#eef4f5] p-6 text-center text-sm text-[#4b6a73]">
      {children}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-md border-l-4 border-turq bg-[#e4f5f3] px-4 py-3">{children}</div>;
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 240" aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round">
        <g className="wave-anim">
          <path d="M-80 120 Q-40 20 0 120 T80 120 T160 120 T240 120 T320 120 T400 120 T480 120 T560 120 T640 120" stroke="#2bb3a8" strokeWidth="3" />
          <path d="M-80 120 Q-40 60 0 120 T80 120 T160 120 T240 120 T320 120 T400 120 T480 120 T560 120 T640 120" stroke="#0f4c5c" strokeWidth="2" opacity=".45" />
        </g>
        <g stroke="#2bb3a8" strokeWidth="5" opacity=".3">
          <path d="M40 90v60M70 60v120M100 80v80M130 40v160M160 70v100M190 95v50M220 55v130M250 85v70M280 30v180M310 75v90M340 100v40M370 60v120M400 85v70M430 50v140M460 95v50M490 70v100M520 105v30" />
        </g>
      </g>
    </svg>
  );
}

/** JSON-LD : `<` échappé pour éviter l'injection de balises. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
