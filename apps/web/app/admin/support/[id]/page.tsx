import { AdminSupportDetailClient } from "./AdminSupportDetailClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminSupportDetailClient id={id} />;
}

