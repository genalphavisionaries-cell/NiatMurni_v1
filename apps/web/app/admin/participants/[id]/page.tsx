import { AdminParticipantDetailClient } from "./AdminParticipantDetailClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function AdminParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminParticipantDetailClient id={id} />;
}

