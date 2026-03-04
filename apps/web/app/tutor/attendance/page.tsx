export const metadata = {
  title: "Attendance | Tutor | Niat Murni",
};

export default function TutorAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-500">Mark and view attendance (data from Go API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Attendance list will be loaded from Go API.</p>
      </div>
    </div>
  );
}
