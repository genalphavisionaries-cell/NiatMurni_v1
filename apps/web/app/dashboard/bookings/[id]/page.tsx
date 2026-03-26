import { BookingDetailClient } from "@/components/dashboard-bookings/BookingDetailClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default async function DashboardBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetailClient id={id} />;
}

