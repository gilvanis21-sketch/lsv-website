import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/ui";
import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, alternateName: SITE.short, url: SITE.url }} />
      <Header />
      <main id="contenu" className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
