import Link from "next/link";

export const metadata = {
  title: "Settings | Admin | Niat Murni",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">System and user settings</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/settings/users"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">Users</h2>
          <p className="mt-1 text-sm text-gray-500">Admin and tutor accounts</p>
        </Link>
        <Link
          href="/admin/settings/system"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">System</h2>
          <p className="mt-1 text-sm text-gray-500">System configuration</p>
        </Link>
      </div>
    </div>
  );
}
