"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type ClassSession, type Program } from "@/lib/admin-api";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function AdminClassesClient() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [filtered, setFiltered] = useState<ClassSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "upcoming" | "this_week" | "today" | "completed" | "cancelled">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkStartsAt, setBulkStartsAt] = useState("");
  const [bulkEndsAt, setBulkEndsAt] = useState("");

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

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    const tagged = sessions.filter((s) => {
      const status = classifyStatus(s);
      if (statusFilter === "all") return true;
      return status === statusFilter;
    });
    setFiltered(tagged);
    setSelectedIds((prev) => prev.filter((id) => tagged.some((s) => s.id === id)));
  }, [sessions, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class session?")) return;
    try {
      await adminApi.deleteClassSession(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const allVisibleSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((s) => s.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filtered.map((s) => s.id)])));
    }
  };

  const runBulkUpdate = async (payload: Partial<ClassSession>) => {
    if (selectedIds.length === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(selectedIds.map((id) => adminApi.updateClassSession(id, payload)));
      setSelectedIds([]);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBulkSaving(false);
    }
  };

  const deactivateOne = async (session: ClassSession) => {
    try {
      await adminApi.updateClassSession(session.id, { status: "cancelled" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate class");
    }
  };

  const activateOne = async (session: ClassSession) => {
    try {
      await adminApi.updateClassSession(session.id, { status: "confirmed" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to activate class");
    }
  };

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

      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="upcoming">Upcoming</option>
              <option value="this_week">This Week</option>
              <option value="today">Today</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {filtered.length} class session(s)
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            {selectedIds.length} selected
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runBulkUpdate({ status: "confirmed" })}
              disabled={bulkSaving}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-60"
            >
              Activate Selected
            </button>
            <button
              type="button"
              onClick={() => runBulkUpdate({ status: "cancelled" })}
              disabled={bulkSaving}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-60"
            >
              Deactivate Selected
            </button>
            <input
              type="datetime-local"
              value={bulkStartsAt}
              onChange={(e) => setBulkStartsAt(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={bulkEndsAt}
              onChange={(e) => setBulkEndsAt(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (!bulkStartsAt || !bulkEndsAt) return;
                void runBulkUpdate({
                  starts_at: new Date(bulkStartsAt).toISOString(),
                  ends_at: new Date(bulkEndsAt).toISOString(),
                });
              }}
              disabled={bulkSaving || !bulkStartsAt || !bulkEndsAt}
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Bulk Change Date
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-gray-50/80">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Program</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Trainer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Starts</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Ends</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Mode</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const uiStatus = classifyStatus(row);
                  const isCancelled = String(row.status) === "cancelled";
                  return (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} />
                      </td>
                      <td className="px-4 py-3">{row.id}</td>
                      <td className="px-4 py-3">{row.program?.name ?? "—"}</td>
                      <td className="px-4 py-3">{row.trainer?.name ?? "—"}</td>
                      <td className="px-4 py-3">{new Date(row.starts_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{new Date(row.ends_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{row.mode}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {labelForStatus(uiStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(row);
                              setModal("edit");
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            aria-label="Edit"
                            title="Edit / Change Date"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {isCancelled ? (
                            <button
                              type="button"
                              onClick={() => activateOne(row)}
                              className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => deactivateOne(row)}
                              className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700"
                            >
                              Deactivate
                            </button>
                          )}
                          <Link href={`/class/${row.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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

function classifyStatus(session: ClassSession): "new" | "upcoming" | "this_week" | "today" | "completed" | "cancelled" {
  const status = String(session.status ?? "").toLowerCase();
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";
  if (status === "draft" || status === "scheduled") return "new";

  const now = new Date();
  const starts = new Date(session.starts_at);
  const startDay = new Date(starts.getFullYear(), starts.getMonth(), starts.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (startDay === today) return "today";

  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  if (starts >= now && starts <= weekEnd) return "this_week";
  return "upcoming";
}

function labelForStatus(status: ReturnType<typeof classifyStatus>): string {
  switch (status) {
    case "new":
      return "New";
    case "upcoming":
      return "Upcoming";
    case "this_week":
      return "This Week";
    case "today":
      return "Today";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
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
  const [fee, setFee] = useState<number>(
    initial?.price != null
      ? Number(initial.price)
      : initial?.price_cents != null
        ? Number(initial.price_cents) / 100
        : 0
  );
  const [trainers, setTrainers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    adminApi.getTutors({ per_page: 100 }).then((r) => setTrainers(r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const startsDate = new Date(startsAt);
      const endsDate = new Date(endsAt);
      if (Number.isNaN(startsDate.getTime()) || Number.isNaN(endsDate.getTime())) {
        throw new Error("Please provide valid start and end date/time.");
      }

      const payload = {
        program_id: programId,
        trainer_id: trainerId ? parseInt(trainerId, 10) : null,
        starts_at: startsDate.toISOString(),
        ends_at: endsDate.toISOString(),
        mode,
        language,
        venue: venue || null,
        capacity,
        price: fee,
        min_threshold: Math.min(capacity, 5),
        status: initial?.status ?? "confirmed",
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee (RM)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value) || 0)}
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
