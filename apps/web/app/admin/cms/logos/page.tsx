export const metadata = {
  title: "Logos | CMS | Admin | Niat Murni",
};

export default function AdminCmsLogosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Logos</h1>
        <p className="mt-1 text-sm text-gray-500">Brand logos (Laravel CMS API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Logo management via Laravel CMS.</p>
      </div>
    </div>
  );
}
