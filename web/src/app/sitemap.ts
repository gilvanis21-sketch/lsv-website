import type { MetadataRoute } from "next";
import { TOPICS } from "@/lib/content";
import { getPublishedPosts, getPublishedServices } from "@/lib/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/le-laboratoire", "/nos-services", "/la-voix", "/polymnivox", "/references", "/actualites", "/contact", "/informations-pratiques", "/mentions-legales", "/confidentialite", "/cookies"];
  const [services, posts] = await Promise.all([getPublishedServices(), getPublishedPosts()]);
  const paths = [...fixed, ...services.map((s) => `/nos-services/${s.slug}`), ...TOPICS.map((t) => `/la-voix/${t.slug}`), ...posts.map((p) => `/actualites/${p.post.slug}`)];
  return paths.map((p) => ({ url: `${SITE.url}${p}` }));
}
