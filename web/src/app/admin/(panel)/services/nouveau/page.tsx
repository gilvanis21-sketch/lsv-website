import { requirePermission } from "@/lib/auth";
import { ServiceForm } from "../ServiceForm";
import { Flash, Title } from "../../../ui";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requirePermission("content");
  const { e } = await searchParams;
  return (<><Title>Nouveau service</Title><Flash code={e} /><ServiceForm /></>);
}
