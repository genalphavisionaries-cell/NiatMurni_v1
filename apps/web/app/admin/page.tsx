import { fetchUpcomingClasses } from "@/lib/api";
import { StatCard } from "@/components/dashboard";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Niat Murni",
  description: "Admin dashboard",
};

export default async function AdminDashboardPage() {
  let upcomingClasses: Array<{ id: number; program_name: string; starts_at: string }> = [];
  try {
    const classes = await fetchUpcomingClasses();
    upcomingClasses = (classes ?? []).slice(0, 5).map((c) => ({
      id: c.id,
      program_name: c.program_name,
      starts_at: c.starts_at,
    }));
  } catch {
    // use placeholder when API not available
  }

  const stats = [
    { title: "Revenue", value: "—", description: "This period", icon: DollarSign },
    { title: "Total Bookings", value: "—", description: "All time", icon: BookOpen },
    { title: "Upcoming Sessions", value: upcomingClasses.length, description: "Next 30 days", icon: Calendar },
    { title: "Active Trainers", value: "—", description: "Currently active", icon: Users },
    { title: "Completion Rate", value: "—", description: "Program completion", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Overview of platform activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} description={s.description} icon={s.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Bookings</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Latest registrations and payments</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
                  <th className="pb-3 font-medium">Booking</th>
                  <th className="pb-3 font-medium">Participant</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]/50">
                  <td className="py-3 text-[var(--text-primary)]">—</td>
                  <td className="py-3 text-[var(--text-primary)]">—</td>
                  <td className="py-3 text-[var(--text-secondary)]">—</td>
                  <td className="py-3 text-[var(--text-secondary)]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Link
            href="/admin/bookings"
            className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
          >
            View all bookings →
          </Link>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alerts
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>No alerts at the moment.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upcoming Classes</h2>
            <ul className="mt-3 space-y-2">
              {upcomingClasses.length === 0 ? (
                <li className="text-sm text-[var(--text-secondary)]">No upcoming classes.</li>
              ) : (
                upcomingClasses.map((c) => (
                  <li key={c.id} className="flex justify-between gap-2 text-sm">
                    <span className="truncate text-[var(--text-primary)]">{c.program_name}</span>
                    <span className="shrink-0 text-[var(--text-secondary)]">
                      {new Date(c.starts_at).toLocaleDateString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <Link
              href="/admin/classes"
              className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all classes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
