import { fetchUpcomingClasses } from "@/lib/api";
import { CoursesTableClient, type CourseRow } from "./CoursesTableClient";

export const metadata = {
  title: "My Courses | Participant | Niat Murni",
};

export default async function ParticipantCoursesPage() {
  let classes: CourseRow[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      status: c.status ?? "—",
    }));
  } catch {
    // placeholder
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-500">Your classes (data from Go API)</p>
      </div>
      <CoursesTableClient data={classes} />
    </div>
  );
}
