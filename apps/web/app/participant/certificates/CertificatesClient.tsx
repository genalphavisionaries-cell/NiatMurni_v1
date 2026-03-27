"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchParticipantCertificates,
  type ParticipantCertificate,
} from "@/lib/participant-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<ParticipantCertificate>[] = [
  { accessorKey: "certificate_number", header: "Certificate No." },
  { accessorKey: "program_name", header: "Program" },
  {
    accessorKey: "issue_date",
    header: "Issued",
    cell: ({ row }) => row.original.issue_date ?? "—",
  },
  {
    id: "download",
    header: "",
    cell: ({ row }) => (
      <a
        href={row.original.download_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-gray-900 hover:underline"
      >
        Download PDF
      </a>
    ),
  },
];

export function CertificatesClient() {
  const [certificates, setCertificates] = useState<ParticipantCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUnauthorized(false);
    fetchParticipantCertificates()
      .then((res) => {
        if (!cancelled) setCertificates(res.certificates ?? []);
      })
      .catch((err) => {
        if (!cancelled && (err.message?.includes("401") || err.message?.includes("Unauthenticated")))
          setUnauthorized(true);
        else if (!cancelled) setCertificates([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading your certificates…</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">
          Log in to view and download your certificates.
        </p>
        <Link
          href="/participant/login"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          You have no issued certificates yet. Certificates appear here after you complete a course and one is issued.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
      <DataTable data={certificates} columns={columns} />
    </div>
  );
}
