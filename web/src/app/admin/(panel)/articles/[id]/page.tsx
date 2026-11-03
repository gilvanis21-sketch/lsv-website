import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db, posts } from "@/db";
import { requirePermission } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { PostForm } from "../PostForm";
import { Flash, Title } from "../../../ui";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [[post], categories, { e }] = await Promise.all([db.select().from(posts).where(eq(posts.id, id)).limit(1), getCategories(), searchParams]);
  if (!post) notFound();
  return (<><Title>Modifier l&apos;article</Title><Flash code={e} /><PostForm post={post} categories={categories} /></>);
}
