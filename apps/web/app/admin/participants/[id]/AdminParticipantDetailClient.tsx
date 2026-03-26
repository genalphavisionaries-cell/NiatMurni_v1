"use client";

import { useEffect, useState } from "react";
import { adminApi, type ParticipantDetail } from "@/lib/admin-api";

export function AdminParticipantDetailClient({ id }: { id: string }) {
  const [detail, setDetail] = useState<ParticipantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const participantId = Number(id);
      if (!Number.isFinite(participantId) || participantId <= 0) {
        setError("Invalid participant ID.");
        setLoading(false);
        return;
      }
      try {
        const data = await adminApi.getParticipant(participantId);
        if (!cancelled) setDetail(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load participant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Participant Details</h1>
      </div>
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading...
        </div>
      ) : error || !detail ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Participant not found."}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Profile Info</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="ID" value={String(detail.profile.id)} />
              <Info label="Full Name" value={detail.profile.full_name || "-"} />
              <Info label="Email" value={detail.profile.email || "-"} />
              <Info label="Phone" value={detail.profile.phone || "-"} />
              <Info label="Identity No" value={detail.profile.identity_no || "-"} />
              <Info label="Employer" value={detail.profile.employer?.name || "-"} />
            </div>
          </div>

          <SectionCard
            title="Bookings"
            emptyText="No bookings found."
            rows={detail.bookings.map((b) => `${b.id} • ${b.class_name || "-"} • ${b.status} • ${b.payment_status || "-"}`)}
          />

          <SectionCard
            title="Payments"
            emptyText="No payments found."
            rows={detail.payments.map((p) => `${p.id} • RM ${p.amount.toFixed(2)} • ${p.status} • ${p.payment_date || "-"}`)}
          />

          <SectionCard
            title="Certificates"
            emptyText="No certificates found."
            rows={detail.certificates.map((c) => `${c.id} • ${c.certificate_number || "-"} • ${c.status} • ${c.issue_date || "-"}`)}
          />
        </div>
      )}
    </section>
  );
}

function SectionCard({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={`${title}-${index}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              {row}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value}</p>
    </div>
  );
}

