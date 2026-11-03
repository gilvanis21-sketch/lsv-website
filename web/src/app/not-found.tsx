import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ButtonLink, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenu" className="flex-1">
        <Section>
          <h1 className="text-4xl">Page introuvable</h1>
          <p className="mt-3">La page demandée n&apos;existe pas ou a été déplacée.</p>
          <div className="mt-6"><ButtonLink href="/">Retour à l&apos;accueil</ButtonLink></div>
        </Section>
      </main>
      <Footer settings={{}} />
    </>
  );
}
