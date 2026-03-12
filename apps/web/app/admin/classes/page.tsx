import { fetchUpcomingClasses } from "@/lib/api";
import { AdminClassesTableClient, type AdminClassRow } from "./AdminClassesTableClient";

export const metadata = {
  title: "Classes | Admin | Niat Murni",
};

export default async function AdminClassesPage() {
  let classes: AdminClassRow[] = [];
  try {
    const data = await fetchUpcomingClasses();
    classes = (data ?? []).map((c) => ({
      id: c.id,
      program_name: c.program_name ?? "—",
      starts_at: c.starts_at,
      mode: c.mode ?? "—",
      status: c.status ?? "—",
    }));
  } catch {
    // placeholder when API unavailable
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
        <p className="mt-1 text-sm text-gray-500">Manage class sessions (data from Go API)</p>
      </div>
      <AdminClassesTableClient data={classes} />
    </div>
  );
}
