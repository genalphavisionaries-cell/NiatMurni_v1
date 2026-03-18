import { PublicSiteShell } from "@/components/public";
import ClassDetailClient from "./ClassDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function ClassDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <PublicSiteShell>
      <ClassDetailClient id={id} />
    </PublicSiteShell>
  );
}
