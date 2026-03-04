import { StatCard } from "@/components/dashboard";
import { Calendar, Users, Video } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Tutor Dashboard | Niat Murni",
};

export default function TutorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your teaching overview</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Today's classes" value="0" description="Sessions today" icon={Calendar} />
        <StatCard title="Upcoming sessions" value="—" description="Next 7 days" icon={Video} />
        <StatCard title="Students attending" value="—" description="Total enrolled" icon={Users} />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
        <p className="mt-1 text-sm text-gray-500">View your classes, take attendance, and manage materials.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/tutor/classes"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            My Classes
          </Link>
          <Link
            href="/tutor/attendance"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Attendance
          </Link>
          <Link
            href="/tutor/materials"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Materials
          </Link>
        </div>
      </div>
    </div>
  );
}
