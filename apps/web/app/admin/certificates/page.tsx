export const metadata = {
  title: "Certificates | Admin | Niat Murni",
};

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">Issue and manage certificates (data from Go API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Certificate list will be loaded from Go API.</p>
      </div>
    </div>
  );
}
