"use client";

type Props = {
  paymentStatus: "paid" | "pending_verification";
  summary: {
    reservationId: number;
    classTitle: string;
    seatCount: number;
    totalAmount: number;
    deliveryMethod: string;
  };
  onGoPortal: () => void;
  onBackHome: () => void;
};

export default function PaymentSuccessPanel({ paymentStatus, summary, onGoPortal, onBackHome }: Props) {
  const isPaid = paymentStatus === "paid";

  return (
    <section className={`space-y-4 rounded-2xl border p-5 shadow-sm ${isPaid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="text-center">
        <div className="text-3xl">{isPaid ? "✅" : "⏳"}</div>
        <h3 className={`mt-2 text-lg font-semibold ${isPaid ? "text-emerald-900" : "text-amber-900"}`}>
          {isPaid ? "Payment Successful — Your Seat is Confirmed" : "Payment Submitted — Pending Verification"}
        </h3>
        <p className={`mt-2 text-sm ${isPaid ? "text-emerald-800" : "text-amber-800"}`}>
          {isPaid
            ? "Thank you for your registration. Your booking has been confirmed and a confirmation email has been sent."
            : "We have received your payment receipt and it is under review. You will receive an email once approved."}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p><span className="font-medium">Reservation ID:</span> {summary.reservationId}</p>
        <p><span className="font-medium">Class:</span> {summary.classTitle}</p>
        <p><span className="font-medium">Seat count:</span> {summary.seatCount}</p>
        <p><span className="font-medium">Total amount:</span> RM {summary.totalAmount.toFixed(2)}</p>
        <p><span className="font-medium">Delivery method:</span> {summary.deliveryMethod}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
        <p className="text-sm font-semibold text-slate-900">Access Your Participant Portal</p>
        <p className="mt-1 text-xs text-slate-600">If first-time login, set your password using your registered email.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onGoPortal} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Go to Participant Portal
          </button>
          <button type="button" onClick={onBackHome} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}

