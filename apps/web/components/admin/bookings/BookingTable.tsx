"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { adminApi, type Booking } from "@/lib/admin-api";

type Props = {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

type ConfirmModalState =
  | null
  | {
      title: string;
      description?: string;
      actionLabel: string;
      kind: "refund" | "rejectPayment" | "changeStatus";
      bookingId: number;
      paymentId?: number;
      newStatus?: string;
    };

function formatDate(d: string | undefined | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

function badgeClasses(tone: "green" | "yellow" | "red") {
  if (tone === "green") return "bg-green-50 text-green-800 border-green-200";
  if (tone === "yellow") return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-red-50 text-red-800 border-red-200";
}

function badgeToneForBooking(booking: Booking): { tone: "green" | "yellow" | "red"; label: string } {
  const bookingStatus = booking.status ?? "";
  const activePaymentStatus = booking.active_payment?.status ?? booking.payment_status ?? "";

  const paymentIsRed = ["failed", "refunded"].includes(String(activePaymentStatus));
  const bookingIsRed = ["cancelled", "failed", "refunded"].includes(String(bookingStatus));
  if (paymentIsRed || bookingIsRed) {
    return { tone: "red", label: bookingStatus || "—" };
  }

  const bookingIsGreen = ["confirmed", "completed"].includes(String(bookingStatus));
  const paymentIsGreen = ["paid"].includes(String(activePaymentStatus));
  if (bookingIsGreen || paymentIsGreen) {
    return { tone: "green", label: bookingStatus || "—" };
  }

  const bookingIsYellow = ["pending", "no_show"].includes(String(bookingStatus)) || activePaymentStatus === "pending";
  if (bookingIsYellow) {
    return { tone: "yellow", label: bookingStatus || "—" };
  }

  return { tone: "yellow", label: bookingStatus || "—" };
}

export default function BookingTable({ bookings, loading, onRefresh }: Props) {
  const [confirm, setConfirm] = useState<ConfirmModalState>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const rows = useMemo(() => bookings ?? [], [bookings]);

  const closeConfirm = () => {
    setConfirm(null);
    setReason("");
  };

  const submitConfirm = async () => {
    if (!confirm) return;
    const key = `${confirm.kind}:${confirm.bookingId}:${confirm.paymentId ?? ""}:${confirm.newStatus ?? ""}`;
    setProcessing(key);
    try {
      if (confirm.kind === "refund") {
        await adminApi.refundBooking(confirm.bookingId);
      }
      if (confirm.kind === "rejectPayment" && confirm.paymentId) {
        await adminApi.rejectManualPayment(confirm.paymentId, { reason: reason.trim() || undefined });
      }
      if (confirm.kind === "changeStatus" && confirm.newStatus) {
        await adminApi.changeBookingStatus(confirm.bookingId, confirm.newStatus);
      }
      await onRefresh();
      closeConfirm();
    } catch (e) {
      // Keep silent in UI (caller will reload). Still stop spinner.
      console.error(e);
      setProcessing(null);
    }
  };

  const approvePayment = async (paymentId: number | undefined) => {
    if (!paymentId) return;
    const key = `approvePayment:${paymentId}`;
    setProcessing(key);
    try {
      await adminApi.approveManualPayment(paymentId);
      await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-gray-50/80">
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Booking ID</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Participant Name</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Class Name</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Seat Count</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Payment Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Booking Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Created At</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const active = b.active_payment;
                const paymentStatus = active?.status ?? b.payment_status ?? "";
                const paymentTone: "green" | "yellow" | "red" = ["paid", "confirmed", "completed"].includes(String(paymentStatus))
                  ? "green"
                  : ["failed", "refunded"].includes(String(paymentStatus))
                    ? "red"
                    : "yellow";
                const paymentLabel = paymentStatus ? String(paymentStatus).replace("_", " ") : "—";

                const bookingTone = badgeToneForBooking(b).tone;
                const bookingLabel = (b.status ?? "—").replace("_", " ");

                const isManualPending = active?.provider === "manual" && String(active?.status) === "pending";
                const isRefundEligible = String(active?.status) === "paid";

                return (
                  <tr key={b.id} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-6 py-4 text-gray-700 font-medium">{b.id}</td>
                    <td className="px-6 py-4 text-gray-700">{b.participant?.full_name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {b.class_session?.program?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(b.class_session?.starts_at)}</td>
                    <td className="px-6 py-4 text-gray-700">{b.seat_count ?? 1}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses(paymentTone)}`}>
                        {paymentLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses(bookingTone)}`}>
                        {bookingLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(b.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/admin/bookings/${b.id}`} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          View
                        </Link>

                        {isManualPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => approvePayment(active?.id)}
                              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                              disabled={Boolean(processing)}
                            >
                              Approve Payment
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirm({
                                  kind: "rejectPayment",
                                  title: "Reject payment",
                                  description: "This will mark the manual payment as failed.",
                                  actionLabel: "Reject",
                                  bookingId: b.id,
                                  paymentId: active?.id,
                                })
                              }
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                              disabled={!active?.id || Boolean(processing)}
                            >
                              Reject Payment
                            </button>
                          </>
                        )}

                        {isRefundEligible && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                kind: "refund",
                                title: "Refund booking",
                                description: "This will initiate a refund through the backend refund flow.",
                                actionLabel: "Refund",
                                bookingId: b.id,
                              })
                            }
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                            disabled={Boolean(processing)}
                          >
                            Refund
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({
                              kind: "changeStatus",
                              title: "Change booking status",
                              actionLabel: "Update",
                              bookingId: b.id,
                            })
                          }
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          disabled={Boolean(processing)}
                        >
                          Change Status
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-[var(--border)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{confirm.title}</h3>
                {confirm.description && <p className="mt-1 text-sm text-gray-600">{confirm.description}</p>}
              </div>
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {confirm.kind === "changeStatus" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500">New status</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={confirm.newStatus ?? ""}
                    onChange={(e) => setConfirm((p) => (p ? { ...p, newStatus: e.target.value } : p))}
                  >
                    <option value="">Select…</option>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="no_show">no_show</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              )}

              {(confirm.kind === "rejectPayment" || confirm.kind === "refund") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500">Note (optional)</label>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Add a short note for admin audit"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                disabled={Boolean(processing)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitConfirm}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                disabled={
                  Boolean(processing) ||
                  (confirm.kind === "changeStatus" && !confirm.newStatus) ||
                  (confirm.kind === "rejectPayment" && !confirm.paymentId)
                }
              >
                {processing ? "Processing…" : confirm.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

