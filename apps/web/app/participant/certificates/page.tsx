import { CertificatesClient } from "./certificates/CertificatesClient";

export const metadata = {
  title: "Certificates | Participant | Niat Murni",
};

export default function ParticipantCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and download your issued certificates. Only valid (non-revoked) certificates are shown.
        </p>
      </div>
      <CertificatesClient />
    </div>
  );
}
