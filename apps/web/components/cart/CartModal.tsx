"use client";

import { useMemo, useState } from "react";
import {
  createReservation,
  createPaymentCheckout,
  type CreateReservationResponse,
} from "@/lib/api";
import { BookingForm, type BookingFormValues } from "./BookingForm";
import { useCart } from "./CartProvider";

const DELIVERY_FEES: Record<"normal" | "fast", number> = {
  normal: 10,
  fast: 20,
};

export function CartModal() {
  const { cart, isOpen, closeCart, clearCart, updateSeatCount } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CreateReservationResponse | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [form, setForm] = useState<BookingFormValues>({
    full_name: "",
    phone: "",
    identity_no: "",
    email: "",
    company_name: "",
    delivery_type: "normal",
    delivery_address: "",
  });

  const courseTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.price_per_seat * cart.seat_count;
  }, [cart]);

  const deliveryFee = DELIVERY_FEES[form.delivery_type];
  const grandTotal = courseTotal + deliveryFee;

  if (!isOpen || !cart) return null;

  const resetModalState = () => {
    setStep(1);
    setError(null);
    setSuccess(null);
    setReservation(null);
    setReceipt(null);
    setForm({
      full_name: "",
      phone: "",
      identity_no: "",
      email: "",
      company_name: "",
      delivery_type: "normal",
      delivery_address: "",
    });
  };

  const submitReservation = async (): Promise<boolean> => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await createReservation({
        class_session_id: cart.class_session_id,
        seat_count: cart.seat_count,
        full_name: form.full_name,
        identity_no: form.identity_no,
        phone: form.phone,
        email: form.email || undefined,
        company_name: form.company_name || undefined,
        delivery_address: form.delivery_address || undefined,
        delivery_type: form.delivery_type,
        delivery_fee: deliveryFee,
      });
      setReservation(result);
      setSuccess("Reservation created successfully.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create reservation.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const payNow = async () => {
    if (!reservation) return;
    setError(null);
    setLoading(true);
    try {
      const { checkout_url } = await createPaymentCheckout({
        reservation_id: reservation.reservation_id,
      });
      window.location.href = checkout_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start payment.");
      setLoading(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!form.full_name.trim() || !form.phone.trim() || !form.identity_no.trim()) {
        setError("Please fill in Full Name, Phone, and Identity No before continuing.");
        return;
      }
      if (!reservation) {
        const ok = await submitReservation();
        if (!ok) return;
      }
      setStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
            <p className="text-xs text-slate-500">
              Step {step} of 3 · {step === 1 ? "Cart Summary" : step === 2 ? "Participant Details" : "Payment Method"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeCart}
              className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
              disabled={loading}
              title="Minimize"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => {
                closeCart();
                resetModalState();
              }}
              className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
              disabled={loading}
              title="Close"
            >
              x
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {step === 1 && (
            <section className="rounded-2xl border border-slate-200 p-4 text-sm shadow-sm">
              <h3 className="mb-2 text-base font-semibold text-slate-900">Cart Summary</h3>
              <p className="text-sm text-slate-700">{cart.class_title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-slate-600">Seats</span>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={cart.seat_count}
                  onChange={(e) => updateSeatCount(Number(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  disabled={loading || !!reservation}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                RM {cart.price_per_seat.toFixed(2)} x {cart.seat_count}
              </p>
            </section>
          )}

          {step === 2 && (
            <>
              <BookingForm values={form} onChange={setForm} disabled={loading || !!reservation} />

              <section className="rounded-2xl border border-slate-200 p-4 text-sm shadow-sm">
                <h3 className="mb-2 text-base font-semibold text-slate-900">Total Summary</h3>
                <div className="flex justify-between">
                  <span>Course total</span>
                  <span>RM {courseTotal.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Delivery fee</span>
                  <span>RM {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold">
                  <span>Grand total</span>
                  <span>RM {grandTotal.toFixed(2)}</span>
                </div>
              </section>
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p>}

          {step === 3 && reservation && (
            <section className="space-y-3 rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-sm text-slate-700">
                Reservation ID: <span className="font-semibold">{reservation.reservation_id}</span>
              </p>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <p className="font-medium text-emerald-800">Secure Payment Powered by Stripe</p>
                <p className="mt-1 text-xs text-emerald-700">
                  [ STRIPE ] Your payment is encrypted and protected.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={payNow}
                  disabled={loading}
                  className="rounded-lg border border-amber-600 bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      Redirecting...
                    </span>
                  ) : (
                    "Pay Now Online"
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 bg-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Pay Manually
                </button>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Manual Payment</p>
                <p className="mt-1 text-xs text-slate-600">QR placeholder + bank details placeholder</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-3 block w-full text-sm"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                  onClick={() => console.log("Manual receipt draft", { reservation, receipt })}
                >
                  Save Manual Receipt (temporary)
                </button>
              </div>

              <button
                type="button"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
                onClick={() => {
                  clearCart();
                  closeCart();
                  setReservation(null);
                  setSuccess(null);
                  setError(null);
                }}
              >
                Done
              </button>
            </section>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))}
              disabled={loading || step === 1}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
            >
              ← Back
            </button>
            {step < 3 && (
              <button
                type="button"
                onClick={goNext}
                disabled={loading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    Processing...
                  </span>
                ) : (
                  "Next →"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
