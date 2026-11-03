import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { categories, db, posts, services, siteSettings } from "@/db";

export const SETTING_KEYS = {
  phone: "Téléphone",
  contact_email: "E-mail de contact",
  address: "Adresse",
  hours: "Horaires",
  access: "Modalités d'accès",
  pricing: "Tarifs (texte général)",
} as const;
export type SettingKey = keyof typeof SETTING_KEYS;

export async function getSettings(): Promise<Partial<Record<string, string>>> {
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const getPublishedServices = () => db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.position), asc(services.title));
export const getServiceBySlug = async (slug: string) => (await db.select().from(services).where(and(eq(services.slug, slug), eq(services.published, true))).limit(1))[0];

const visible = () => and(eq(posts.status, "publie"), isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date()));

export async function getPublishedPosts(categorySlug?: string) {
  const rows = await db
    .select({ post: posts, category: categories })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(visible())
    .orderBy(desc(posts.publishedAt));
  return categorySlug ? rows.filter((r) => r.category?.slug === categorySlug) : rows;
}

export async function getPublishedPost(slug: string) {
  const [row] = await db
    .select({ post: posts, category: categories })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), visible()))
    .limit(1);
  return row;
}

export const getCategories = () => db.select().from(categories).orderBy(asc(categories.name));
