"use client";

import Link from "next/link";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export type AdminClassRow = {
  id: number;
  program_name: string;
  starts_at: string;
  mode: string;
  status: string;
};

const columns: ColumnDef<AdminClassRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "program_name", header: "Program" },
  {
    accessorKey: "starts_at",
    header: "Starts",
    cell: ({ row }) => new Date(row.original.starts_at).toLocaleString(),
  },
  { accessorKey: "mode", header: "Mode" },
  { accessorKey: "status", header: "Status" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link href={`/class/${row.original.id}`} className="text-sm font-medium text-gray-900 hover:underline">
        View
      </Link>
    ),
  },
];

export function AdminClassesTableClient({ data }: { data: AdminClassRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
