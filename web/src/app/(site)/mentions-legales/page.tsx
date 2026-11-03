import type { Metadata } from "next";
import { PageHeader, Section, Tbd } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      <Section><p className="max-w-3xl">Éditeur, directeur de la publication, hébergeur, SIRET : informations à fournir et à faire valider. <Tbd /></p></Section>
    </>
  );
}
