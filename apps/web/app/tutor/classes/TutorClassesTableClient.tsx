"use client";

import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { Video } from "lucide-react";

export type TutorClassRow = {
  id: number;
  program_name: string;
  starts_at: string;
  zoom_join_url?: string;
};

const columns: ColumnDef<TutorClassRow>[] = [
  { accessorKey: "program_name", header: "Program" },
  {
    accessorKey: "starts_at",
    header: "Starts",
    cell: ({ row }) => new Date(row.original.starts_at).toLocaleString(),
  },
  {
    id: "join",
    header: "Join",
    cell: ({ row }) =>
      row.original.zoom_join_url ? (
        <a
          href={row.original.zoom_join_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Video className="h-4 w-4" />
          Join Zoom
        </a>
      ) : (
        "—"
      ),
  },
];

export function TutorClassesTableClient({ data }: { data: TutorClassRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
