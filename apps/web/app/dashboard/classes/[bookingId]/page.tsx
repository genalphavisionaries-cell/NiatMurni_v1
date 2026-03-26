import { MyClassClient } from "@/components/dashboard-classes/MyClassClient";

export async function generateStaticParams() {
  return [{ bookingId: "1" }];
}

export default async function MyClassPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <MyClassClient bookingId={bookingId} />;
}

