"use client";

import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export type ParticipantRow = {
  id: number;
  full_name: string;
  email: string;
  nric_passport: string;
};

const columns: ColumnDef<ParticipantRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "full_name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "nric_passport", header: "NRIC/Passport" },
];

export function ParticipantsTableClient({ data }: { data: ParticipantRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
