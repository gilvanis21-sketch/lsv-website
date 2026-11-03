import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Dynamique : l'URL du site vient de l'environnement d'exécution, pas de la construction de l'image.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
