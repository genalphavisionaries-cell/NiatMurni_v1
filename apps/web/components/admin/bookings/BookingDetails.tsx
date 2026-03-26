"use client";

import { useEffect, useState } from "react";
import { adminApi as adminApiNamed, type Booking } from "@/lib/admin-api";

type Props = {
  bookingId: number;
};

type CertificateShape = {
  id: number;
  status: string;
  pdf_path?: string | null;
  certificate_number?: string | null;
};

type ConfirmModalState =
  | null
  | {
      title: string;
      description?: string;
      actionLabel: string;
      kind: "refund" | "rejectPayment" | "changeStatus" | "reissueCertificate";
      paymentId?: number;
      newStatus?: string;
    };

function formatDate(d: string | undefined | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

function toneForPaymentStatus(status: string | null | undefined): "green" | "yellow" | "red" {
  const s = String(status ?? "");
  if (["paid", "confirmed", "completed"].includes(s)) return "green";
  if (["failed", "refunded"].includes(s)) return "red";
  return "yellow";
}

function badgeClasses(tone: "green" | "yellow" | "red") {
  if (tone === "green") return "bg-green-50 text-green-800 border-green-200";
  if (tone === "yellow") return "bg-yellow-50 text-yellow-900 border-yellow-200";
  return "bg-red-50 text-red-800 border-red-200";
}

function formatCurrency(amount: string | null | undefined) {
  if (!amount) return "—";
  return `RM ${amount}`;
}

export default function BookingDetails({ bookingId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmModalState>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiNamed.getBooking(bookingId);
      setBooking(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const activePayment = booking?.active_payment ?? null;
  const manualPending = activePayment?.provider === "manual" && String(activePayment?.status) === "pending";
  const paidOrEligibleForRefund = activePayment?.status === "paid";

  const closeConfirm = () => {
    setConfirm(null);
    setReason("");
  };

  const submitConfirm = async () => {
    if (!confirm) return;
    const key = `${confirm.kind}:${bookingId}:${confirm.paymentId ?? ""}:${confirm.newStatus ?? ""}`;
    setProcessingKey(key);
    try {
      if (confirm.kind === "refund") {
        await adminApiNamed.refundBooking(bookingId);
      }
      if (confirm.kind === "rejectPayment" && confirm.paymentId) {
        await adminApiNamed.rejectManualPayment(confirm.paymentId, { reason: reason.trim() || undefined });
      }
      if (confirm.kind === "changeStatus" && confirm.newStatus) {
        await adminApiNamed.changeBookingStatus(bookingId, confirm.newStatus);
      }
      closeConfirm();
      await load();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setProcessingKey(null);
    }
  };

  const approvePayment = async () => {
    if (!activePayment?.id) return;
    const key = `approve:${activePayment.id}`;
    setProcessingKey(key);
    try {
      await adminApiNamed.approveManualPayment(activePayment.id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setProcessingKey(null);
    }
  };

  const certificate = (booking as any)?.certificate as CertificateShape | undefined;
  const certificateStatus = certificate?.status ?? "none";
  const showIssue = !certificate;

  const issueCertificate = async () => {
    const key = `issue-cert:${bookingId}`;
    setProcessingKey(key);
    try {
      await adminApiNamed.issueCertificate(bookingId);
      await load();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Certificate issue failed");
    } finally {
      setProcessingKey(null);
    }
  };

  const reissueCertificate = async () => {
    const key = `reissue-cert:${bookingId}`;
    setProcessingKey(key);
    try {
      await adminApiNamed.reissueCertificate(bookingId);
      await load();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Certificate reissue failed");
    } finally {
      setProcessingKey(null);
    }
  };

  const bookingParticipant = booking?.participant;
  const classSession = booking?.class_session;
  const program = classSession?.program;
  const tutorName =
    (classSession as any)?.trainer?.name ??
    (classSession as any)?.trainer_name ??
    (classSession as any)?.tutor?.user?.name ??
    "—";

  const paymentTone = toneForPaymentStatus(activePayment?.status ?? booking?.payment_status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Booking #{bookingId}</h1>
        <p className="mt-1 text-sm text-gray-500">Manage participant, payment, certificate and status.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Participant Info</h2>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{bookingParticipant?.full_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">IC / Passport</p>
                    <p className="mt-1 text-sm text-gray-900">{bookingParticipant?.nric_passport ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{bookingParticipant?.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{bookingParticipant?.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Company</p>
                    <p className="mt-1 text-sm text-gray-900">{(bookingParticipant as any)?.employer?.name ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Booking Info</h2>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Class</p>
                    <p className="mt-1 text-sm text-gray-900">{program?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(classSession?.starts_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Seat count</p>
                    <p className="mt-1 text-sm text-gray-900">{booking?.seat_count ?? 1}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Booking status</p>
                    <p className="mt-1 text-sm text-gray-900">{booking?.status ?? "—"}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          kind: "changeStatus",
                          title: "Change booking status",
                          actionLabel: "Update",
                        })
                      }
                      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={Boolean(processingKey)}
                    >
                      Change Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">Payment Info</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Payment method</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {activePayment?.provider === "manual" ? "Manual" : activePayment?.provider ? "Stripe" : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Payment status</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${badgeClasses(paymentTone)}`}>
                      {String(activePayment?.status ?? booking?.payment_status ?? "—")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Amount</p>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency((booking as any)?.payment_amount ?? null)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Paid at</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(activePayment?.paid_at ?? booking?.paid_at)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {activePayment?.provider === "manual" && activePayment?.receipt_url && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Receipt</p>
                    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-gray-50 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activePayment.receipt_url} alt="Manual payment receipt" className="max-h-[340px] w-full object-contain" />
                    </div>
                  </div>
                )}

                {manualPending && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={approvePayment}
                      className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      disabled={Boolean(processingKey)}
                    >
                      {processingKey?.startsWith("approve") ? "Processing…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          kind: "rejectPayment",
                          title: "Reject manual payment",
                          actionLabel: "Reject",
                          paymentId: activePayment?.id,
                        })
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      disabled={!activePayment?.id || Boolean(processingKey)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>

            {paidOrEligibleForRefund && (
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({
                      kind: "refund",
                      title: "Refund booking",
                      actionLabel: "Refund",
                    })
                  }
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  disabled={Boolean(processingKey)}
                >
                  Refund
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">Tutor Info</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Tutor name</p>
                <p className="mt-1 text-sm text-gray-900">{tutorName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Earning status</p>
                <p className="mt-1 text-sm text-gray-900">{(booking as any)?.tutor_earning_status ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">Certificate</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900">{certificateStatus}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={issueCertificate}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  disabled={Boolean(processingKey) || !showIssue}
                >
                  Issue
                </button>
                <button
                  type="button"
                  onClick={reissueCertificate}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  disabled={Boolean(processingKey) || !certificate}
                >
                  Reissue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                disabled={Boolean(processingKey)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitConfirm}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                disabled={
                  Boolean(processingKey) ||
                  (confirm.kind === "changeStatus" && !confirm.newStatus) ||
                  (confirm.kind === "rejectPayment" && !confirm.paymentId)
                }
              >
                {processingKey ? "Processing…" : confirm.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

