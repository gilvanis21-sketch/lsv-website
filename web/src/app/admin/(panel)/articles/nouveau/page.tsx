import { requirePermission } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { PostForm } from "../PostForm";
import { Flash, Title } from "../../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const [{ e }, categories] = await Promise.all([searchParams, getCategories()]);
  return (<><Title>Nouvel article</Title><Flash code={e} /><PostForm categories={categories} /></>);
}
