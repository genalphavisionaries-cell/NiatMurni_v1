"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, type ClassSession, type Voucher, type VoucherStatus, type VoucherType } from "@/lib/admin-api";
import { safeTrim } from "@/lib/safe-string-utils";

type VoucherFormState = {
  id?: number;
  code: string;
  type: VoucherType;
  value: string;
  min_seats: string;
  max_uses: string;
  valid_from: string;
  valid_until: string;
  applicable_class_session_id: string;
  status: VoucherStatus;
};

const EMPTY_FORM: VoucherFormState = {
  code: "",
  type: "fixed",
  value: "",
  min_seats: "",
  max_uses: "",
  valid_from: "",
  valid_until: "",
  applicable_class_session_id: "",
  status: "active",
};

function toInputDateTime(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusBadge(status: VoucherStatus) {
  return status === "active"
    ? "bg-green-50 text-green-800 border-green-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
}

export default function AdminFinanceVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | VoucherStatus>("");
  const [form, setForm] = useState<VoucherFormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [voucherRes, classesRes] = await Promise.all([
        adminApi.getVouchers({ per_page: 100, status: statusFilter || undefined, search: query || undefined }),
        adminApi.getClassSessions({ per_page: 100 }),
      ]);
      setVouchers(voucherRes.data ?? []);
      setClassSessions(classesRes.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const classSessionOptions = useMemo(() => {
    return classSessions.map((s) => ({
      id: s.id,
      label: `${s.program?.name ?? "Class"} (${new Date(s.starts_at).toLocaleDateString()})`,
    }));
  }, [classSessions]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (v: Voucher) => {
    setForm({
      id: v.id,
      code: v.code,
      type: v.type,
      value: v.value ?? "",
      min_seats: v.min_seats != null ? String(v.min_seats) : "",
      max_uses: v.max_uses != null ? String(v.max_uses) : "",
      valid_from: toInputDateTime(v.valid_from),
      valid_until: toInputDateTime(v.valid_until),
      applicable_class_session_id: v.applicable_class_session_id != null ? String(v.applicable_class_session_id) : "",
      status: v.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: safeTrim(form.code),
        type: form.type,
        value: form.type === "free_delivery" ? null : (form.value ? Number(form.value) : null),
        min_seats: form.min_seats ? Number(form.min_seats) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        applicable_class_session_id: form.applicable_class_session_id ? Number(form.applicable_class_session_id) : null,
        status: form.status,
      };

      if (form.id) {
        await adminApi.updateVoucher(form.id, payload);
      } else {
        await adminApi.createVoucher(payload);
      }

      closeForm();
      await load();
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Failed to save voucher");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (id: number) => {
    try {
      await adminApi.toggleVoucher(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle voucher");
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("Delete this voucher?")) return;
    try {
      await adminApi.deleteVoucher(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete voucher");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vouchers</h1>
          <p className="mt-1 text-sm text-gray-500">Finance → Payments & Delivery → Vouchers</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Create Voucher
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | VoucherStatus)}
              className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="block text-xs font-medium text-gray-600">Search code</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. RAMADAN10"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-gray-500">
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Min Seats</th>
                <th className="pb-3 font-medium">Usage</th>
                <th className="pb-3 font-medium">Valid Until</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={8}>Loading vouchers...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={8}>No vouchers found.</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-[var(--border)]/50">
                    <td className="py-3 font-medium text-gray-900">{v.code}</td>
                    <td className="py-3 text-gray-700">{v.type}</td>
                    <td className="py-3 text-gray-700">{v.type === "free_delivery" ? "Free delivery" : v.value ?? "—"}</td>
                    <td className="py-3 text-gray-700">{v.min_seats ?? "—"}</td>
                    <td className="py-3 text-gray-700">{v.used_count} / {v.max_uses ?? "∞"}</td>
                    <td className="py-3 text-gray-700">{v.valid_until ? new Date(v.valid_until).toLocaleString() : "—"}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void onToggle(v.id)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {v.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(v.id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{form.id ? "Edit Voucher" : "Create Voucher"}</h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600">Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VoucherType }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="fixed">fixed</option>
                  <option value="percentage">percentage</option>
                  <option value="free_delivery">free_delivery</option>
                </select>
              </div>

              {form.type !== "free_delivery" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600">Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600">Min Seats (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.min_seats}
                  onChange={(e) => setForm((p) => ({ ...p, min_seats: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Valid From</label>
                <input
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Valid Until</label>
                <input
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Applicable Class (optional)</label>
                <select
                  value={form.applicable_class_session_id}
                  onChange={(e) => setForm((p) => ({ ...p, applicable_class_session_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All classes</option>
                  {classSessionOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as VoucherStatus }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : form.id ? "Update Voucher" : "Create Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

