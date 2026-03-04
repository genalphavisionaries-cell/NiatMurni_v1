import { fetchUpcomingClasses } from "@/lib/api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const metadata = {
  title: "My Courses | Participant | Niat Murni",
};

export default async function ParticipantCoursesPage() {
  let classes: { id: number; program_name: string; starts_at: string; status: string }[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      status: c.status ?? "—",
    }));
  } catch {
    // placeholder
  }

  const columns: ColumnDef<typeof classes[0]>[] = [
    { accessorKey: "program_name", header: "Program" },
    { accessorKey: "starts_at", header: "Date", cell: ({ row }) => new Date(row.original.starts_at).toLocaleString() },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-500">Your classes (data from Go API)</p>
      </div>
      <DataTable data={classes} columns={columns} />
    </div>
  );
}
