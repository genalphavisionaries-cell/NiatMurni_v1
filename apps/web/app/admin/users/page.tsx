"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, type ManagedAdminUser } from "@/lib/admin-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";
import { safeTrim } from "@/lib/safe-string-utils";
import { Plus, Pencil, KeyRound, Power, PowerOff } from "lucide-react";

type AdminRole = "super_admin" | "operations_admin" | "finance_admin" | "cms_admin" | "accountant";
type ModuleKey =
  | "programs"
  | "classes"
  | "bookings"
  | "participants"
  | "tutors"
  | "certificates"
  | "finance";

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "operations_admin", label: "Operations Admin" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "cms_admin", label: "CMS Admin" },
  { value: "accountant", label: "Accountant" },
];

const MODULE_OPTIONS: { value: ModuleKey; label: string }[] = [
  { value: "programs", label: "Programs" },
  { value: "classes", label: "Classes" },
  { value: "bookings", label: "Bookings" },
  { value: "participants", label: "Participants" },
  { value: "tutors", label: "Tutors" },
  { value: "certificates", label: "Certificates" },
  { value: "finance", label: "Finance" },
];

function roleSupportsModules(role: AdminRole): boolean {
  return role === "operations_admin" || role === "finance_admin";
}

function roleLabel(role: string): string {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found?.label ?? role;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<ManagedAdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<ManagedAdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        per_page: 100,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setUsers(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!safeTrim(search)) return users;
    const q = safeTrim(search).toLowerCase();
    return users.filter((u) =>
      [u.name, u.email, u.role, u.status].some((v) => v.toLowerCase().includes(q))
    );
  }, [users, search]);

  const handleDeactivate = async (user: ManagedAdminUser) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    const confirmMsg =
      nextStatus === "inactive"
        ? `Deactivate ${user.name}?`
        : `Activate ${user.name}?`;
    if (!confirm(confirmMsg)) return;
    try {
      await adminApi.updateUser(user.id, { status: nextStatus });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Status update failed");
    }
  };

  const columns: ColumnDef<ManagedAdminUser>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => roleLabel(row.original.role),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            row.original.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === "active";
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(user);
                setModal("edit");
              }}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Edit user"
              title="Edit user"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setResetTarget(user)}
              className="text-amber-600 hover:text-amber-800"
              aria-label="Reset password"
              title="Reset password"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleDeactivate(user)}
              className={isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}
              aria-label={isActive ? "Deactivate user" : "Activate user"}
              title={isActive ? "Deactivate user" : "Activate user"}
            >
              {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage admin users and access status.</p>
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
          Add User
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, role…"
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "inactive")}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <DataTable data={filtered} columns={columns} />
      )}

      {(modal === "create" || modal === "edit") && (
        <UserFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setModal("closed");
            setEditing(null);
          }}
          onSaved={() => {
            setModal("closed");
            setEditing(null);
            void load();
          }}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          onClose={() => setResetTarget(null)}
          onSaved={() => {
            setResetTarget(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ManagedAdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<AdminRole>((initial?.role as AdminRole) ?? "operations_admin");
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [modules, setModules] = useState<ModuleKey[]>(
    (initial?.modules?.filter((m): m is ModuleKey => MODULE_OPTIONS.some((opt) => opt.value === m)) ?? [])
  );
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!initial) {
      if (!password || password.length < 12) {
        setError("Password must be at least 12 characters.");
        return;
      }
      if (password !== passwordConfirmation) {
        setError("Password confirmation does not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const payloadModules = roleSupportsModules(role) ? modules : [];
      if (initial) {
        await adminApi.updateUser(initial.id, { name, email, role, status, modules: payloadModules });
      } else {
        await adminApi.createUser({
          name,
          email,
          role,
          status,
          modules: payloadModules,
          password,
          password_confirmation: passwordConfirmation,
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{initial ? "Edit user" : "Add user"}</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => {
                  const nextRole = e.target.value as AdminRole;
                  setRole(nextRole);
                  if (!roleSupportsModules(nextRole)) {
                    setModules([]);
                  }
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {roleSupportsModules(role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Module Access</label>
              <p className="mt-1 text-xs text-gray-500">
                Select modules for this role.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                {MODULE_OPTIONS.map((option) => {
                  const checked = modules.includes(option.value);
                  return (
                    <label key={option.value} className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setModules((prev) => {
                            if (e.target.checked) {
                              return Array.from(new Set([...prev, option.value]));
                            }
                            return prev.filter((v) => v !== option.value);
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {!initial && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  minLength={12}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  minLength={12}
                  required
                />
              </div>
            </>
          )}
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

function ResetPasswordModal({
  target,
  onClose,
  onSaved,
}: {
  target: ManagedAdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.resetUserPassword(target.id, {
        password,
        password_confirmation: passwordConfirmation,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Password reset failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Reset password</h2>
        <p className="mt-1 text-sm text-gray-500">{target.name} ({target.email})</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              minLength={12}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              minLength={12}
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Resetting…" : "Reset password"}
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
