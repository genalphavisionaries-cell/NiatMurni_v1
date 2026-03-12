"use client";

import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export type TutorStudentRow = {
  id: number;
  name: string;
  email: string;
  class_name: string;
};

const columns: ColumnDef<TutorStudentRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "class_name", header: "Class" },
];

export function TutorStudentsTableClient({ data }: { data: TutorStudentRow[] }) {
  return <DataTable data={data} columns={columns} />;
}
