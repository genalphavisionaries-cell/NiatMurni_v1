"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type Participant } from "@/lib/admin-api";

export function AdminParticipantsClient() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const load = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getParticipants({
        search: search || undefined,
        per_page: 15,
        page: targetPage,
      });
      setParticipants(res.data);
      setMeta({
        current_page: res.current_page,
        last_page: res.last_page,
        per_page: res.per_page,
        total: res.total,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(page), 300);
    return () => clearTimeout(t);
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Participants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registered participants. Search by name, email, phone, or identity number.
          </p>
        </div>
        <input
          type="search"
          placeholder="Search name, email, phone, identity no..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
      ) : participants.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          No participants found.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-gray-50/80">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Created At</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/admin/participants/${p.id}`)}
                    className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-700">{p.id}</td>
                    <td className="px-4 py-3 text-gray-700">{p.full_name || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{p.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{p.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm">
            <p className="text-gray-600">
              Page {meta.current_page} of {meta.last_page} • {meta.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                disabled={meta.current_page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((v) => Math.min(meta.last_page, v + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
