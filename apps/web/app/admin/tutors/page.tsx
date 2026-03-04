export const metadata = {
  title: "Tutors | Admin | Niat Murni",
};

export default function AdminTutorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tutors</h1>
        <p className="mt-1 text-sm text-gray-500">Manage tutors (data from Go API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Tutor list will be loaded from Go API.</p>
      </div>
    </div>
  );
}
