import BookingDetails from "@/components/admin/bookings/BookingDetails";

export const metadata = {
  title: "Booking Details | Admin | Niat Murni",
};

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetails bookingId={Number(id)} />;
}

