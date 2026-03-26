"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getParticipantBookingDetail, type ParticipantBookingDetail } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";

export function BookingDetailClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ParticipantBookingDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    const bookingId = Number(id);
    if (!Number.isFinite(bookingId) || bookingId <= 0) {
      setError("Invalid booking ID.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getParticipantBookingDetail(bookingId);
        if (cancelled) return;
        setDetail(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load booking details.");
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
      <Link href="/dashboard/bookings" className="inline-flex text-sm font-medium text-blue-700 hover:underline">
        ← Back to bookings
      </Link>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : error || !detail ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Booking not found."}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{detail.class_name}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {detail.class_date || "-"} {detail.class_time ? `• ${detail.class_time}` : ""}
                </p>
              </div>
              <StatusBadge status={detail.status} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Booking Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info label="Trainer" value={detail.trainer_name || "-"} />
              <Info label="Payment Status" value={detail.payment_status || "-"} />
              <Info label="Attendance Status" value={detail.attendance_status || "-"} />
              <Info label="Exam Status" value={detail.exam_status || "-"} />
            </div>

            {detail.zoom_link ? (
              <a
                href={detail.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Join via Zoom
              </a>
            ) : (
              <p className="mt-5 text-sm text-slate-500">Zoom link is not available yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
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

