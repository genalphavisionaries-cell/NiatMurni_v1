export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-600">
          This is your dashboard overview. Upcoming classes, certificates, and account activity can be shown here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Active bookings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Certificates</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
        </div>
      </div>
    </section>
  );
}

