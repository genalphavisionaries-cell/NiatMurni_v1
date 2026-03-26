export default function DashboardProfilePage() {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">Manage your account details and contact information.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Full name</p>
            <p className="mt-1 text-sm text-slate-900">-</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 text-sm text-slate-900">-</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</p>
            <p className="mt-1 text-sm text-slate-900">-</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Active</p>
          </div>
        </div>
      </div>
    </section>
  );
}

