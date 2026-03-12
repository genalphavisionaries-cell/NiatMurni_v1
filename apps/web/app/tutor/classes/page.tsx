import { fetchUpcomingClasses } from "@/lib/api";
import { TutorClassesTableClient, type TutorClassRow } from "./TutorClassesTableClient";

export const metadata = {
  title: "My Classes | Tutor | Niat Murni",
};

export default async function TutorClassesPage() {
  let classes: TutorClassRow[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      zoom_join_url: c.zoom_join_url,
    }));
  } catch {
    // placeholder
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Classes</h1>
        <p className="mt-1 text-sm text-gray-500">Your scheduled sessions (data from Go API)</p>
      </div>
      <TutorClassesTableClient data={classes} />
    </div>
  );
}
