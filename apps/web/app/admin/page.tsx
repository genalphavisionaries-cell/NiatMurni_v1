"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchUpcomingClasses } from "@/lib/api";
import { adminApi, type DashboardOverview } from "@/lib/admin-api";
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
type UpcomingClass = { id: number; program_name: string; starts_at: string };

const DASHBOARD_FALLBACK: DashboardOverview = {
  revenue: { today: 0, this_month: 0, this_year: 0 },
  bookings: { today: 0, this_week: 0, this_month: 0, total: 0 },
  participants: { total: 0 },
  tutors: { active: 0, total: 0 },
  classes: { upcoming: 0, ongoing: 0 },
  certificates: { issued: 0 },
};

function formatRM(value: number | null | undefined, loading: boolean): string {
  if (loading) return "-";
  if (value == null) return "-";
  return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMetric(value: number | null | undefined, loading: boolean): string | number {
  if (loading) return "-";
  if (value == null) return "-";
  return value;
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardOverview>(DASHBOARD_FALLBACK);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [overviewRes, classes] = await Promise.all([
          adminApi.getDashboardOverview(),
          fetchUpcomingClasses(),
        ]);
        if (cancelled) return;

        setDashboardData(overviewRes.data ?? DASHBOARD_FALLBACK);
        setUpcomingClasses(
          (classes ?? []).slice(0, 5).map((c) => ({
            id: c.id,
            program_name: c.program_name,
            starts_at: c.starts_at,
          }))
        );
      } catch (error) {
        console.error("Failed to load admin dashboard overview", error);
        if (!cancelled) {
          setDashboardData(DASHBOARD_FALLBACK);
          setUpcomingClasses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Revenue",
        value: formatRM(dashboardData.revenue?.this_month, loading),
        description: "This period",
        icon: DollarSign,
      },
      {
        title: "Total Bookings",
        value: formatMetric(dashboardData.bookings?.total, loading),
        description: "All time",
        icon: BookOpen,
      },
      {
        title: "Upcoming Sessions",
        value: formatMetric(dashboardData.classes?.upcoming, loading),
        description: "Next 30 days",
        icon: Calendar,
      },
      {
        title: "Active Trainers",
        value: formatMetric(dashboardData.tutors?.active, loading),
        description: "Currently active",
        icon: Users,
      },
      { title: "Completion Rate", value: "-", description: "Program completion", icon: TrendingUp },
    ],
    [dashboardData, loading]
  );

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
