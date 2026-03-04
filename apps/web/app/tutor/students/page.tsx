import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

type Row = { id: number; name: string; email: string; class_name: string };

export const metadata = {
  title: "Students | Tutor | Niat Murni",
};

export default function TutorStudentsPage() {
  const data: Row[] = []; // TODO: from Go API

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "class_name", header: "Class" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">Students in your classes (data from Go API)</p>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
