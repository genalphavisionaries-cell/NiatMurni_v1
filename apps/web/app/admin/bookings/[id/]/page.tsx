import BookingDetails from "@/components/admin/bookings/BookingDetails";

export const metadata = {
  title: "Booking Details | Admin | Niat Murni",
};

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
  return <BookingDetails bookingId={Number(params.id)} />;
}

