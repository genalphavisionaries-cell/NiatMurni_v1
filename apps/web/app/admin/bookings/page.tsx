import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

type BookingRow = { id: number; participant: string; class_session: string; status: string; paid_at: string | null };

export const metadata = {
  title: "Bookings | Admin | Niat Murni",
};

export default function AdminBookingsPage() {
  const data: BookingRow[] = []; // TODO: fetch from Go API GET /bookings or similar

  const columns: ColumnDef<BookingRow>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "participant", header: "Participant" },
    { accessorKey: "class_session", header: "Class" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "paid_at", header: "Paid at", cell: ({ row }) => row.original.paid_at ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">All bookings (data from Go API)</p>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
