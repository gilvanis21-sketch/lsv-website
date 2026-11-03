import type { ReactNode } from "react";
import { FLASH } from "./flash";

export const field = "mt-1 w-full rounded-lg border border-[#9fb4ba] bg-white px-3 py-2";
export const btn = "rounded-lg border-2 border-petrol bg-petrol px-5 py-2 font-semibold text-white hover:bg-petrol-dark";
export const btnOutline = "rounded-lg border-2 border-petrol bg-white px-5 py-2 font-semibold text-petrol hover:bg-mist";
export const btnDanger = "rounded-lg border-2 border-[#b3261e] bg-white px-5 py-2 font-semibold text-[#b3261e] hover:bg-[#fdeceb]";

export const STATUS_LABEL: Record<string, string> = { nouvelle: "Nouvelle", en_attente: "En attente", confirmee: "Confirmée", refusee: "Refusée", traitee: "Traitée" };
const STATUS_CLS: Record<string, string> = { nouvelle: "bg-[#2a6fb0]", en_attente: "bg-[#9a6a00]", confirmee: "bg-[#2e7d32]", refusee: "bg-[#b3261e]", traitee: "bg-[#5f6b70]" };

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-sm text-white ${STATUS_CLS[status] ?? "bg-gray-500"}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function Flash({ code }: { code?: string }) {
  const f = code ? FLASH[code] : undefined;
  if (!f) return null;
  return <p role={f.ok ? "status" : "alert"} className={`mb-4 rounded-md px-4 py-3 ${f.ok ? "bg-[#e4f5f3] text-[#0a3440]" : "bg-[#fdeceb] text-[#8c1d18]"}`}>{f.text}</p>;
}

export function Title({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (<div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl">{children}</h1>{action}</div>);
}

export const dt = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(d) : "");
export const card = "rounded-xl border border-line bg-white p-5";
