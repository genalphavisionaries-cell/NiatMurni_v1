import { BookingsTableClient, type BookingRow } from "./BookingsTableClient";

export const metadata = {
  title: "Bookings | Admin | Niat Murni",
};

export default function AdminBookingsPage() {
  const data: BookingRow[] = []; // TODO: fetch from Go API GET /bookings or similar

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">All bookings (data from Go API)</p>
      </div>
      <BookingsTableClient data={data} />
    </div>
  );
}
