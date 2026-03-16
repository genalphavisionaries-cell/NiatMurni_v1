"use client";

import { useEffect, useState } from "react";
import { adminApi, type Program } from "@/lib/admin-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function AdminProgramsClient() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<Program | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getPrograms({ per_page: 100 });
      setPrograms(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this program? Classes under it must be removed first.")) return;
    try {
      await adminApi.deleteProgram(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const columns: ColumnDef<Program>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "delivery_mode", header: "Mode" },
    { accessorKey: "price", header: "Price" },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (row.original.is_active ? "Yes" : "No"),
    },
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Programs</h1>
          <p className="mt-1 text-sm text-gray-500">Course programs. Create classes from these.</p>
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
          Add program
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
        <DataTable data={programs} columns={columns} />
      )}

      {(modal === "create" || modal === "edit") && (
        <ProgramForm
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

function ProgramForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Program;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [defaultCapacity, setDefaultCapacity] = useState(initial?.default_capacity ?? 30);
  const [minThreshold, setMinThreshold] = useState(initial?.min_threshold ?? 5);
  const [deliveryMode, setDeliveryMode] = useState(initial?.delivery_mode ?? "online");
  const [durationHours, setDurationHours] = useState(initial?.duration_hours ?? 3);
  const [price, setPrice] = useState(initial?.price ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || undefined,
        description: description || undefined,
        default_capacity: defaultCapacity,
        min_threshold: minThreshold,
        delivery_mode: deliveryMode,
        duration_hours: durationHours,
        // Program.price is typed as string | null | undefined, so send string to satisfy TS
        price: price || null,
        is_active: isActive,
      };
      if (initial) {
        await adminApi.updateProgram(initial.id, payload);
      } else {
        await adminApi.createProgram(payload);
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
        <h2 className="text-lg font-semibold text-gray-900">{initial ? "Edit program" : "Add program"}</h2>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto from name if empty"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Default capacity</label>
              <input
                type="number"
                min={1}
                value={defaultCapacity}
                onChange={(e) => setDefaultCapacity(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min threshold</label>
              <input
                type="number"
                min={0}
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery mode</label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="online">Online</option>
                <option value="in_person">In person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 150.00"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
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
