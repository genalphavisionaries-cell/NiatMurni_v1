"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getParticipantBookingDetail, type ParticipantBookingDetail } from "@/lib/api";

type AttendanceState = "pending" | "attended" | "absent";
type ExamState = "pending" | "pass" | "fail";

function normalizeAttendance(status?: string | null): AttendanceState {
  const value = String(status ?? "").toLowerCase();
  if (value === "attended" || value === "present") return "attended";
  if (value === "absent" || value === "no_show") return "absent";
  return "pending";
}

function normalizeExam(status?: string | null): ExamState {
  const value = String(status ?? "").toLowerCase();
  if (value === "pass" || value === "passed") return "pass";
  if (value === "fail" || value === "failed") return "fail";
  return "pending";
}

export function MyClassClient({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ParticipantBookingDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = Number(bookingId);

    if (!Number.isFinite(id) || id <= 0) {
      setError("Invalid booking ID.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getParticipantBookingDetail(id);
        if (cancelled) return;
        setDetail(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load class details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const attendance = normalizeAttendance(detail?.attendance_status);
  const exam = normalizeExam(detail?.exam_status);

  return (
    <section className="space-y-4">
      <Link href="/dashboard/bookings" className="inline-flex text-sm font-medium text-blue-700 hover:underline">
        ← Back to bookings
      </Link>

      {loading ? (
        <Card>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </Card>
      ) : error || !detail ? (
        <Card className="border-red-200 bg-red-50 text-red-700">{error || "Class information not found."}</Card>
      ) : (
        <>
          <Card>
            <h1 className="text-lg font-semibold text-slate-900">My Class</h1>
            <p className="mt-1 text-sm text-slate-600">Your session details and live class access.</p>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">Class Info</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Class Name" value={detail.class_name || "-"} />
              <Info label="Date" value={detail.class_date || "-"} />
              <Info label="Trainer" value={detail.trainer_name || "-"} />
              <Info label="Time" value={detail.class_time || "-"} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">Join Class</h2>
            {detail.zoom_link ? (
              <a
                href={detail.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                Join Zoom Class
              </a>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Zoom link will appear here when available.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">Attendance Status</h2>
            <div className="mt-4">
              <StateBadge kind={attendance}>{attendance}</StateBadge>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">Forms / Questionnaire</h2>
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Placeholder for pre-class form, questionnaire, and future quiz modules.
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-slate-900">Exam Status</h2>
            <div className="mt-4">
              <StateBadge kind={exam}>{exam}</StateBadge>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value}</p>
    </div>
  );
}

function StateBadge({
  children,
  kind,
}: {
  children: ReactNode;
  kind: AttendanceState | ExamState;
}) {
  const ui =
    kind === "attended" || kind === "pass"
      ? "bg-emerald-50 text-emerald-700"
      : kind === "absent" || kind === "fail"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${ui}`}>{children}</span>;
}

