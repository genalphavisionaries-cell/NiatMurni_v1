import { fetchUpcomingClasses } from "@/lib/api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { Video } from "lucide-react";

export const metadata = {
  title: "My Classes | Tutor | Niat Murni",
};

export default async function TutorClassesPage() {
  let classes: { id: number; program_name: string; starts_at: string; zoom_join_url?: string }[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      zoom_join_url: c.zoom_join_url,
    }));
  } catch {
    // placeholder
  }

  const columns: ColumnDef<typeof classes[0]>[] = [
    { accessorKey: "program_name", header: "Program" },
    { accessorKey: "starts_at", header: "Starts", cell: ({ row }) => new Date(row.original.starts_at).toLocaleString() },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Classes</h1>
        <p className="mt-1 text-sm text-gray-500">Your scheduled sessions (data from Go API)</p>
      </div>
      <DataTable data={classes} columns={columns} />
    </div>
  );
}
