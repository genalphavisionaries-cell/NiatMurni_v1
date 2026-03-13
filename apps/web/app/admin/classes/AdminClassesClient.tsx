"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type ClassSession, type Program } from "@/lib/admin-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function AdminClassesClient() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<ClassSession | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessRes, progRes] = await Promise.all([
        adminApi.getClassSessions({ per_page: 20 }),
        adminApi.getPrograms({ per_page: 100 }),
      ]);
      setSessions(sessRes.data);
      setLastPage(sessRes.last_page);
      setPrograms(progRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class session?")) return;
    try {
      await adminApi.deleteClassSession(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const columns: ColumnDef<ClassSession>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => row.original.program?.name ?? "—",
    },
    {
      accessorKey: "trainer",
      header: "Trainer",
      cell: ({ row }) => row.original.trainer?.name ?? "—",
    },
    {
      accessorKey: "starts_at",
      header: "Starts",
      cell: ({ row }) => new Date(row.original.starts_at).toLocaleString(),
    },
    {
      accessorKey: "ends_at",
      header: "Ends",
      cell: ({ row }) => new Date(row.original.ends_at).toLocaleString(),
    },
    { accessorKey: "mode", header: "Mode" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(row.original);
              setModal("edit");
            }}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-800"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Link href={`/class/${row.original.id}`} className="text-sm font-medium text-gray-900 hover:underline">
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
          <p className="mt-1 text-sm text-gray-500">Manage class sessions. Assign programs and tutors.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModal("create");
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add class
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <DataTable data={sessions} columns={columns} />
      )}

      {(modal === "create" || modal === "edit") && (
        <ClassSessionForm
          programs={programs}
          initial={editing ?? undefined}
          onClose={() => {
            setModal("closed");
            setEditing(null);
          }}
          onSaved={() => {
            setModal("closed");
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ClassSessionForm({
  programs,
  initial,
  onClose,
  onSaved,
}: {
  programs: Program[];
  initial?: ClassSession;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [programId, setProgramId] = useState(initial?.program_id ?? programs[0]?.id ?? 0);
  const [trainerId, setTrainerId] = useState<string>(initial?.trainer_id ? String(initial.trainer_id) : "");
  const [startsAt, setStartsAt] = useState(initial?.starts_at?.slice(0, 16) ?? "");
  const [endsAt, setEndsAt] = useState(initial?.ends_at?.slice(0, 16) ?? "");
  const [mode, setMode] = useState(initial?.mode ?? "online");
  const [language, setLanguage] = useState(initial?.language ?? "en");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? 30);
  const [trainers, setTrainers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    adminApi.getTutors({ per_page: 100 }).then((r) => setTrainers(r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const payload = {
        program_id: programId,
        trainer_id: trainerId ? parseInt(trainerId, 10) : null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        mode,
        language,
        venue: venue || null,
        capacity,
        min_threshold: Math.min(capacity, 5),
        status: initial?.status ?? "scheduled",
      };
      if (initial) {
        await adminApi.updateClassSession(initial.id, payload);
      } else {
        await adminApi.createClassSession(payload);
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{initial ? "Edit class" : "Add class session"}</h2>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Program</label>
            <select
              value={programId}
              onChange={(e) => setProgramId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trainer</label>
            <select
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Starts</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ends</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="online">Online</option>
                <option value="in_person">In person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : initial ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
