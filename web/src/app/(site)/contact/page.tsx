import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Notice, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact et demande de rendez-vous",
  description: "Envoyez une demande de rendez-vous au Laboratoire Scientifique de la Voix.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Demander un rendez-vous" />
      <Section>
        <div className="mb-8 max-w-2xl">
          <Notice><strong>Il s&apos;agit d&apos;une demande, pas d&apos;une réservation.</strong> Le créneau n&apos;est confirmé qu&apos;après validation par le laboratoire. <strong>N&apos;indiquez aucune information médicale.</strong></Notice>
        </div>
        <ContactForm />
      </Section>
    </>
  );
}
