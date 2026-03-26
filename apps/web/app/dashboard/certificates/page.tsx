"use client";

import { useEffect, useState } from "react";
import { CertificateCard } from "@/components/dashboard-certificates/CertificateCard";
import { getParticipantCertificates, type ParticipantCertificate } from "@/lib/api";

export default function DashboardCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParticipantCertificate[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getParticipantCertificates();
        if (cancelled) return;
        setItems(rows);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load certificates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">My Certificates</h2>
        <p className="mt-1 text-sm text-slate-600">View and download your issued certificates.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No certificates issued yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <CertificateCard key={item.id} certificate={item} />
          ))}
        </div>
      )}
    </section>
  );
}

