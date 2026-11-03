import type { Metadata } from "next";
import { Notice, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Références et témoignages",
  description: "Partenaires, publications et références scientifiques du Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/references" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Références et témoignages" />
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {["Partenaires", "Publications", "Références scientifiques", "Témoignages"].map((h) => (
            <div key={h}><h2 className="text-2xl">{h}</h2><p className="mt-2 text-[#4b6a73]">Aucun contenu publié pour le moment.</p></div>
          ))}
        </div>
        <div className="mt-8"><Notice>Aucun témoignage n&apos;est publié sans consentement écrit. Aucune donnée de santé identifiante n&apos;est exposée.</Notice></div>
      </Section>
    </>
  );
}
