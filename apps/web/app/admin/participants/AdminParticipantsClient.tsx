"use client";

import { useEffect, useState } from "react";
import { adminApi, type Participant } from "@/lib/admin-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export function AdminParticipantsClient() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getParticipants({ search: search || undefined, per_page: 50 });
      setParticipants(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const columns: ColumnDef<Participant>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "nric_passport", header: "NRIC/Passport" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Participants</h1>
          <p className="mt-1 text-sm text-gray-500">Registered participants. Search by name, email, or NRIC.</p>
        </div>
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <DataTable data={participants} columns={columns} />
      )}
    </div>
  );
}
