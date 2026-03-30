import { PublicSiteShell } from "@/components/public";
import ClassDetailClient from "./ClassDetailClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClassDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <PublicSiteShell>
      <ClassDetailClient id={id} />
    </PublicSiteShell>
  );
}
