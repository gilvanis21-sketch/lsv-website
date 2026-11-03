import type { Metadata } from "next";
import { PageHeader, Section, Tbd } from "@/components/ui";

export const metadata: Metadata = {
  title: "Politique relative aux cookies",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Politique relative aux cookies" />
      <Section><p className="max-w-3xl">Ce site n&apos;utilise actuellement aucun cookie de mesure d&apos;audience ni de publicité : aucun bandeau de consentement n&apos;est nécessaire. Cette page sera mise à jour si de tels traceurs étaient ajoutés. <Tbd /></p></Section>
    </>
  );
}
