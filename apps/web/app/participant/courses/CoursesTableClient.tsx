"use client";

import Link from "next/link";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export type CourseRow = {
  id: number;
  program_name: string;
  starts_at: string;
  status: string;
};

const columns: ColumnDef<CourseRow>[] = [
  { accessorKey: "program_name", header: "Program" },
  {
    accessorKey: "starts_at",
    header: "Date",
    cell: ({ row }) => new Date(row.original.starts_at).toLocaleString(),
  },
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

export function CoursesTableClient({ data }: { data: CourseRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
