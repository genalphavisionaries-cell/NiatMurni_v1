export const metadata = {
  title: "Profile | Tutor | Niat Murni",
};

export default function TutorProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your tutor profile</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Profile form (Laravel auth or Go API).</p>
      </div>
    </div>
  );
}
