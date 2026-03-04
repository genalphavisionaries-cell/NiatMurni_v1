import { fetchUpcomingClasses } from "@/lib/api";
import {
  StatCard,
  type StatCardProps,
} from "@/components/dashboard";
import {
  Award,
  BookOpen,
  Calendar,
  CreditCard,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Niat Murni",
  description: "Admin dashboard",
};

export default async function AdminDashboardPage() {
  let totalClasses = 0;
  try {
    const classes = await fetchUpcomingClasses();
    totalClasses = classes?.length ?? 0;
  } catch {
    // use placeholder when Go API not available
  }

  const stats: StatCardProps[] = [
    { title: "Total Bookings", value: "—", description: "From Go API", icon: BookOpen },
    { title: "Upcoming Classes", value: totalClasses, description: "Next 30 days", icon: Calendar },
    { title: "Participants Registered", value: "—", description: "From Go API", icon: Users },
    { title: "Certificates Issued", value: "—", description: "From Go API", icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of platform activity</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
        <p className="mt-1 text-sm text-gray-500">Manage classes, bookings, and CMS from the sidebar.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/classes"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            View Classes
          </Link>
          <Link
            href="/admin/bookings"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View Bookings
          </Link>
          <Link
            href="/admin/cms/homepage"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Edit Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
