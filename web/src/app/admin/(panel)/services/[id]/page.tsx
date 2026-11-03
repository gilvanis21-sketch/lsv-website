import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { db, services } from "@/db";
import { requirePermission } from "@/lib/auth";
import { ServiceForm } from "../ServiceForm";
import { Flash, Title } from "../../../ui";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [[s], { e }] = await Promise.all([db.select().from(services).where(eq(services.id, id)).limit(1), searchParams]);
  if (!s) notFound();
  return (<><Title>Modifier le service</Title><Flash code={e} /><ServiceForm s={s} /></>);
}
