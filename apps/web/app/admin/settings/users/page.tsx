export const metadata = {
  title: "Users | Settings | Admin | Niat Murni",
};

export default function AdminSettingsUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">Admin and tutor accounts (Laravel auth)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">User management is in Laravel Filament admin. This page can list users via API if exposed.</p>
      </div>
    </div>
  );
}
