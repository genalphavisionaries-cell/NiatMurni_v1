export const metadata = {
  title: "Certificates | Participant | Niat Murni",
};

export default function ParticipantCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">Download your certificates (data from Go API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Certificate list will be loaded from Go API. Download certificate button here.</p>
      </div>
    </div>
  );
}
