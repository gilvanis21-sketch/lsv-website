import type { Metadata } from "next";
import { PageHeader, Section, Tbd } from "@/components/ui";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <Section><p className="max-w-3xl">Responsable du traitement, finalités, bases légales, durées de conservation et droits (accès, rectification, suppression) : brouillon à rédiger avec le client et à faire valider juridiquement avant publication. <Tbd /></p></Section>
    </>
  );
}
