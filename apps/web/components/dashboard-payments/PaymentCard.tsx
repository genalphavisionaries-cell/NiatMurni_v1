"use client";

import type { ParticipantPayment } from "@/lib/api";

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function PaymentCard({ payment }: { payment: ParticipantPayment }) {
  const statusUi =
    payment.status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : payment.status === "failed" || payment.status === "refunded"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment #{payment.id}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{formatAmount(payment.amount)}</p>
      <p className="mt-1 text-sm text-slate-600">Date: {payment.payment_date || "-"}</p>
      <div className="mt-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusUi}`}>
          {payment.status}
        </span>
      </div>

      <div className="mt-4">
        {payment.receipt_url ? (
          <a
            href={payment.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download Receipt
          </a>
        ) : (
          <p className="text-sm text-slate-500">Receipt not available.</p>
        )}
      </div>
    </article>
  );
}

