"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchUpcomingClasses } from "@/lib/api";
import { adminApi, type DashboardOverview } from "@/lib/admin-api";
import { StatCard } from "@/components/dashboard";
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  DollarSign,
  Globe,
  LineChart,
  Receipt,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
type UpcomingClass = { id: number; program_name: string; starts_at: string };
type DashboardOverviewExtended = DashboardOverview & {
  finance?: {
    gross_revenue?: number | null;
    refunds?: number | null;
    net_revenue?: number | null;
  };
  trends?: {
    revenue_daily?: number[] | null;
    bookings_daily?: number[] | null;
  };
  certificates?: {
    issued?: number | null;
    issued_total?: number | null;
    issued_this_month?: number | null;
    revoked?: number | null;
  };
  bookings?: {
    today?: number | null;
    this_week?: number | null;
    this_month?: number | null;
    total?: number | null;
    pending?: number | null;
    paid?: number | null;
    cancelled?: number | null;
  };
  classes?: {
    total?: number | null;
    upcoming?: number | null;
    ongoing?: number | null;
    completed?: number | null;
    total_seats?: number | null;
    booked_seats?: number | null;
  };
  participants?: {
    total?: number | null;
    active?: number | null;
    new_this_month?: number | null;
  };
  external?: {
    google_analytics?: {
      users?: number | null;
      sessions?: number | null;
      page_views?: number | null;
    };
    stripe?: {
      total_revenue?: number | null;
    };
  };
};

const DASHBOARD_FALLBACK: DashboardOverviewExtended = {
  revenue: { today: 0, this_month: 0, this_year: 0 },
  bookings: { today: 0, this_week: 0, this_month: 0, total: 0 },
  participants: { total: 0, active: 0, new_this_month: 0 },
  tutors: { active: 0, total: 0 },
  classes: { total: 0, upcoming: 0, ongoing: 0, completed: 0, total_seats: 0, booked_seats: 0 },
  certificates: { issued: 0, issued_total: 0, issued_this_month: 0, revoked: 0 },
  finance: { gross_revenue: 0, refunds: 0, net_revenue: 0 },
  trends: { revenue_daily: [0, 0, 0, 0, 0, 0, 0], bookings_daily: [0, 0, 0, 0, 0, 0, 0] },
  external: {
    google_analytics: { users: 0, sessions: 0, page_views: 0 },
    stripe: { total_revenue: 0 },
  },
};

function formatRM(value: number | null | undefined, loading: boolean): string {
  if (loading) return "-";
  if (value == null) return "-";
  return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatMetric(value: number | null | undefined, loading: boolean): string | number {
  if (loading) return "-";
  if (value == null) return "-";
  return value.toLocaleString("en-MY");
}

function valueOrZero(value: number | null | undefined): number {
  return value ?? 0;
}

function MiniLineChart({
  values,
  stroke,
}: {
  values: number[];
  stroke: string;
}) {
  const chartValues = values.length === 7 ? values : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...chartValues, 1);
  const points = chartValues
    .map((v, idx) => {
      const x = (idx / (chartValues.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-40 w-full rounded-lg border border-[var(--border)] bg-white p-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Loading dashboard...</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card-bg)]" />
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardOverviewExtended>(DASHBOARD_FALLBACK);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overviewRes, classes, profileRes] = await Promise.all([
          adminApi.getDashboardOverview(),
          fetchUpcomingClasses(),
          adminApi.getMyProfile(),
        ]);
        if (cancelled) return;

        setDashboardData((overviewRes.data as DashboardOverviewExtended) ?? DASHBOARD_FALLBACK);
        const user = profileRes?.data as ({ module_access?: string[]; modules?: string[] } & Record<string, unknown>) | undefined;
        setModules(user?.module_access ?? user?.modules ?? []);
        setRole((user?.role as string) ?? "");
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
          setModules([]);
          setRole("");
          setError("Failed to load dashboard");
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

  const bookedSeats = valueOrZero(dashboardData.classes?.booked_seats);
  const totalSeats = valueOrZero(dashboardData.classes?.total_seats);
  const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  const revenueDaily = dashboardData.trends?.revenue_daily ?? [0, 0, 0, 0, 0, 0, 0];
  const bookingsDaily = dashboardData.trends?.bookings_daily ?? [0, 0, 0, 0, 0, 0, 0];
  const external = dashboardData?.external;
  const hasAccess = (module: string) => role === "super_admin" || modules.includes(module);

  const primaryStats = useMemo(
    () => {
      const cards = [];
      if (hasAccess("finance")) {
        cards.push({
        title: "Revenue",
        value: formatRM(dashboardData.revenue?.this_month, loading),
        description: "This month",
        icon: DollarSign,
      });
      }
      if (hasAccess("bookings")) {
        cards.push({
        title: "Total Bookings",
        value: formatMetric(dashboardData.bookings?.total, loading),
        description: "All time",
        icon: BookOpen,
      });
      }
      if (hasAccess("classes")) {
        cards.push({
        title: "Upcoming Classes",
        value: formatMetric(dashboardData.classes?.upcoming, loading),
        description: "Next 30 days",
        icon: Calendar,
      });
      }
      if (hasAccess("tutors")) {
        cards.push({
        title: "Active Tutors",
        value: formatMetric(dashboardData.tutors?.active, loading),
        description: "Currently active",
        icon: Users,
      });
      }
      if (hasAccess("finance")) {
        cards.push({
        title: "Net Revenue",
        value: formatRM(dashboardData.finance?.net_revenue, loading),
        description: "After refunds",
        icon: Receipt,
      });
      }
      return cards;
    },
    [dashboardData, loading, modules]
  );

  const secondaryStats = useMemo(
    () => {
      const cards = [];
      if (hasAccess("certificates")) {
        cards.push({
        title: "Certificates Issued",
        value: formatMetric(dashboardData.certificates?.issued_this_month, loading),
        description: "This month",
        icon: CheckCircle2,
      });
      }
      if (hasAccess("finance")) {
        cards.push({
        title: "Website Users",
        value: formatMetric(external?.google_analytics?.users, loading),
        description: valueOrZero(external?.google_analytics?.users) === 0 ? "No data yet" : "Google Analytics",
        icon: Globe,
      });
        cards.push({
        title: "Sessions",
        value: formatMetric(external?.google_analytics?.sessions, loading),
        description: valueOrZero(external?.google_analytics?.sessions) === 0 ? "No data yet" : "Google Analytics",
        icon: Activity,
      });
        cards.push({
        title: "Page Views",
        value: formatMetric(external?.google_analytics?.page_views, loading),
        description: valueOrZero(external?.google_analytics?.page_views) === 0 ? "No data yet" : "Google Analytics",
        icon: BarChart3,
      });
        cards.push({
        title: "Stripe Revenue",
        value: formatRM(external?.stripe?.total_revenue, loading),
        description: valueOrZero(external?.stripe?.total_revenue) === 0 ? "Live Stripe revenue • No data yet" : "Live Stripe revenue",
        icon: DollarSign,
      });
      }
      return cards;
    },
    [dashboardData, external, loading, modules]
  );

  const showBusinessInsights = hasAccess("bookings") || hasAccess("classes") || hasAccess("certificates");
  const showLimitedState = !error && primaryStats.length === 0 && secondaryStats.length === 0;

  if (loading) return <LoadingDashboard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Overview of platform activity</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {primaryStats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {primaryStats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              description={s.description}
              icon={s.icon}
              className="h-full p-4 [&>div]:gap-3 [&>div>div>p:first-child]:text-xs [&>div>div>p:nth-child(2)]:mt-0.5 [&>div>div>p:nth-child(2)]:text-xl [&>div>div>p:nth-child(3)]:mt-0.5 [&>div>div+div]:h-8 [&>div>div+div]:w-8 [&>div>div+div>svg]:h-4 [&>div>div+div>svg]:w-4"
            />
          ))}
        </div>
      )}

      {secondaryStats.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs text-gray-500">Analytics & External Metrics</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {secondaryStats.map((s) => (
              <StatCard
                key={s.title}
                title={s.title}
                value={s.value}
                description={s.description}
                icon={s.icon}
                className="h-full p-4 [&>div]:gap-3 [&>div>div>p:first-child]:text-xs [&>div>div>p:nth-child(2)]:mt-0.5 [&>div>div>p:nth-child(2)]:text-xl [&>div>div>p:nth-child(3)]:mt-0.5 [&>div>div+div]:h-8 [&>div>div+div]:w-8 [&>div>div+div>svg]:h-4 [&>div>div+div>svg]:w-4"
              />
            ))}
          </div>
        </div>
      )}

      {showLimitedState && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-secondary)]">
          You only have access to limited modules. Dashboard is customized based on your permissions.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {hasAccess("finance") && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <LineChart className="h-5 w-5 text-[var(--primary)]" />
            Revenue (Last 7 Days)
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Total: {formatRM(revenueDaily.reduce((acc, cur) => acc + cur, 0), false)}
          </p>
          <div className="mt-4">
            <MiniLineChart values={revenueDaily} stroke="#2563eb" />
          </div>
        </div>
        )}
        {hasAccess("bookings") && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <LineChart className="h-5 w-5 text-emerald-600" />
            Bookings (Last 7 Days)
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Total: {bookingsDaily.reduce((acc, cur) => acc + cur, 0).toLocaleString("en-MY")}
          </p>
          <div className="mt-4">
            <MiniLineChart values={bookingsDaily} stroke="#059669" />
          </div>
        </div>
        )}
        {showBusinessInsights && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Business Insights</h2>
          <div className="mt-4 space-y-4 text-sm">
            {hasAccess("bookings") && <div>
              <p className="font-medium text-[var(--text-primary)]">Booking Status</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-[var(--text-secondary)]">
                <div>Pending: {valueOrZero(dashboardData.bookings?.pending).toLocaleString("en-MY")}</div>
                <div>Paid: {valueOrZero(dashboardData.bookings?.paid).toLocaleString("en-MY")}</div>
                <div>Cancelled: {valueOrZero(dashboardData.bookings?.cancelled).toLocaleString("en-MY")}</div>
              </div>
            </div>}
            {hasAccess("classes") && <div>
              <p className="font-medium text-[var(--text-primary)]">Class Capacity</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-[var(--text-secondary)]">
                <div>Total Seats: {totalSeats.toLocaleString("en-MY")}</div>
                <div>Booked Seats: {bookedSeats.toLocaleString("en-MY")}</div>
                <div>Occupancy: {occupancy}%</div>
              </div>
            </div>}
            {hasAccess("certificates") && <div>
              <p className="font-medium text-[var(--text-primary)]">Certificates</p>
              <div className="mt-1 grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
                <div>Issued This Month: {valueOrZero(dashboardData.certificates?.issued_this_month).toLocaleString("en-MY")}</div>
                <div>Total Issued: {valueOrZero(dashboardData.certificates?.issued_total ?? dashboardData.certificates?.issued).toLocaleString("en-MY")}</div>
              </div>
            </div>}
          </div>
        </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Bookings</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Latest registrations and payments (placeholder)</p>
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
  );
}
