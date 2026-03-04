import { fetchUpcomingClasses } from "@/lib/api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const metadata = {
  title: "Classes | Admin | Niat Murni",
};

export default async function AdminClassesPage() {
  let classes: { id: number; program_name: string; starts_at: string; mode: string; status: string }[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      mode: c.mode ?? "—",
      status: c.status ?? "—",
    }));
  } catch {
    // placeholder when API unavailable
  }

  const columns: ColumnDef<{ id: number; program_name: string; starts_at: string; mode: string; status: string }>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => row.getValue("id") },
    { accessorKey: "program_name", header: "Program", cell: ({ row }) => row.getValue("program_name") },
    { accessorKey: "starts_at", header: "Starts", cell: ({ row }) => new Date(String(row.getValue("starts_at"))).toLocaleString() },
    { accessorKey: "mode", header: "Mode", cell: ({ row }) => row.getValue("mode") },
    { accessorKey: "status", header: "Status", cell: ({ row }) => row.getValue("status") },
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
        <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
        <p className="mt-1 text-sm text-gray-500">Manage class sessions (data from Go API)</p>
      </div>
      <DataTable data={classes} columns={columns} />
    </div>
  );
}
