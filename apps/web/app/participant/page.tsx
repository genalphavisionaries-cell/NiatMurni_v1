import { fetchUpcomingClasses } from "@/lib/api";
import { StatCard } from "@/components/dashboard";
import { Award, BookOpen, Video } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Participant Dashboard | Niat Murni",
};

export default async function ParticipantDashboardPage() {
  let upcomingCount = 0;
  let nextClass: { id: number; program_name: string; starts_at: string; zoom_join_url?: string } | null = null;
  try {
    const classes = await fetchUpcomingClasses();
    upcomingCount = classes?.length ?? 0;
    if (classes && classes.length > 0) {
      const c = classes[0];
      nextClass = {
        id: c.id,
        program_name: c.program_name ?? "—",
        starts_at: c.starts_at,
        zoom_join_url: c.zoom_join_url,
      };
    }
  } catch {
    // placeholder
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your learning overview</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Upcoming class" value={upcomingCount > 0 ? "1" : "0"} description="Next session" icon={BookOpen} />
        <StatCard title="Past courses" value="—" description="Completed" icon={BookOpen} />
        <StatCard title="Certificates" value="—" description="Download" icon={Award} />
      </div>
      {nextClass && (
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming class</h2>
          <p className="mt-1 text-sm text-gray-500">{nextClass.program_name} — {new Date(nextClass.starts_at).toLocaleString()}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/class/${nextClass.id}`}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              View details
            </Link>
            {nextClass.zoom_join_url && (
              <a
                href={nextClass.zoom_join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Video className="h-4 w-4" />
                Join Zoom
              </a>
            )}
          </div>
        </div>
      )}
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>
        <p className="mt-1 text-sm text-gray-500">Past courses and certificates.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/participant/courses"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            My Courses
          </Link>
          <Link
            href="/participant/certificates"
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Certificates
          </Link>
        </div>
      </div>
    </div>
  );
}
