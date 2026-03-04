import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

type Row = { id: number; full_name: string; email: string; nric_passport: string };

export const metadata = {
  title: "Participants | Admin | Niat Murni",
};

export default function AdminParticipantsPage() {
  const data: Row[] = []; // TODO: fetch from Go API

  const columns: ColumnDef<Row>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "nric_passport", header: "NRIC/Passport" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Participants</h1>
        <p className="mt-1 text-sm text-gray-500">Registered participants (data from Go API)</p>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
