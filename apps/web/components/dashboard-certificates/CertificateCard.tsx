"use client";

import type { ParticipantCertificate } from "@/lib/api";

export function CertificateCard({ certificate }: { certificate: ParticipantCertificate }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Certificate #{certificate.id}</p>
      <h3 className="mt-1 text-base font-semibold text-slate-900">{certificate.program_name}</h3>
      <p className="mt-1 text-sm text-slate-600">Issued: {certificate.issue_date || "-"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={certificate.download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Preview
        </a>
        <a
          href={certificate.download_url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Download
        </a>
      </div>
    </article>
  );
}

