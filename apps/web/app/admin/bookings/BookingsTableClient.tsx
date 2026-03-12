"use client";

import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export type BookingRow = {
  id: number;
  participant: string;
  class_session: string;
  status: string;
  paid_at: string | null;
};

const columns: ColumnDef<BookingRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "participant", header: "Participant" },
  { accessorKey: "class_session", header: "Class" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "paid_at",
    header: "Paid at",
    cell: ({ row }) => row.original.paid_at ?? "—",
  },
];

export function BookingsTableClient({ data }: { data: BookingRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
