"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createReservation,
  createPaymentCheckout,
  fetchPublicCheckoutSettings,
  submitManualPaymentForBooking,
  type PublicCheckoutSettings,
  type CreateReservationResponse,
} from "@/lib/api";
import { BookingForm, type BookingFormValues } from "./BookingForm";
import { useCart } from "./CartProvider";
import PaymentSuccessPanel from "@/components/checkout/PaymentSuccessPanel";

export function CartModal() {
  const {
    cart,
    isOpen,
    closeCart,
    clearCart,
    removeItem,
    updateSeatCount,
    replacementNotice,
    dismissReplacementNotice,
  } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reservation, setReservation] = useState<CreateReservationResponse | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [checkoutSettings, setCheckoutSettings] = useState<PublicCheckoutSettings | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending_verification" | null>(null);
  const [form, setForm] = useState<BookingFormValues>({
    full_name: "",
    phone: "",
    identity_no: "",
    email: "",
    company_name: "",
    delivery_type: "normal",
    address_line_1: "",
    address_line_2: "",
    postcode: "",
    city: "",
    state: "",
  });

  const courseTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.price_per_seat * cart.seat_count;
  }, [cart]);

  const deliveryFee =
    form.delivery_type === "fast"
      ? Number(checkoutSettings?.delivery.fast.fee ?? 20)
      : Number(checkoutSettings?.delivery.normal.fee ?? 10);
  const grandTotal = courseTotal + deliveryFee;
  const pricePerSeat = Number.isFinite(cart?.price_per_seat) ? (cart?.price_per_seat ?? 0) : 0;

  if (cart && !Number.isFinite(cart.price_per_seat)) {
    console.warn("Missing price for class_session");
  }

  const resetModalState = () => {
    setStep(1);
    setError(null);
    setSuccess(null);
    setReservation(null);
    setReceipt(null);
    setShowManualPayment(false);
    setPaymentStatus(null);
    setForm({
      full_name: "",
      phone: "",
      identity_no: "",
      email: "",
      company_name: "",
      delivery_type: "normal",
      address_line_1: "",
      address_line_2: "",
      postcode: "",
      city: "",
      state: "",
    });
  };

  const getDeliveryAddress = () => {
    const parts = [
      form.address_line_1.trim(),
      form.address_line_2.trim(),
      form.postcode.trim(),
      form.city.trim(),
      form.state.trim(),
    ].filter(Boolean);
    return parts.join(", ");
  };

  const loadCheckoutSettings = async () => {
    const result = await fetchPublicCheckoutSettings();
    if (result) {
      setCheckoutSettings(result);
      if (form.delivery_type === "normal" && !result.delivery.normal.enabled && result.delivery.fast.enabled) {
        setForm((prev) => ({ ...prev, delivery_type: "fast" }));
      }
      if (form.delivery_type === "fast" && !result.delivery.fast.enabled && result.delivery.normal.enabled) {
        setForm((prev) => ({ ...prev, delivery_type: "normal" }));
      }
    }
  };

  const submitReservation = async (): Promise<boolean> => {
    if (!cart) {
      setError("Cart is empty.");
      return false;
    }

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
        delivery_address: getDeliveryAddress() || undefined,
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

  const submitManualPayment = async () => {
    if (!reservation?.booking_id) {
      setError("Booking is not ready. Please retry reservation step.");
      return;
    }
    if (!receipt) {
      setError("Please upload payment receipt before submitting.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await submitManualPaymentForBooking(reservation.booking_id, receipt);
      setPaymentStatus("pending_verification");
      setSuccess("Payment submitted. Awaiting admin verification.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit manual payment.");
    } finally {
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
      if (!form.address_line_1.trim() || !form.city.trim() || !form.state.trim()) {
        setError("Please fill in Address Line 1, City, and State.");
        return;
      }
      if (!/^\d{5}$/.test(form.postcode.trim())) {
        setError("Postcode must be numeric and 5 digits.");
        return;
      }
      if (!reservation) {
        const ok = await submitReservation();
        if (!ok) return;
      }
      setStep(3);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (checkoutSettings) return;
    void loadCheckoutSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, checkoutSettings]);

  if (!isOpen || !cart) return null;

  const manualPaymentEnabled = checkoutSettings?.manual_payment.enabled ?? true;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-black/45" />
      <div className="pointer-events-auto relative z-50 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex max-h-[90vh] flex-col">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-6 py-4">
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

        <div className="overflow-y-auto px-6 py-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {replacementNotice && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <div className="flex items-start justify-between gap-2">
                <span>{replacementNotice}</span>
                <button
                  type="button"
                  className="rounded px-1 text-amber-700 hover:bg-amber-100"
                  onClick={dismissReplacementNotice}
                >
                  x
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <section className="rounded-2xl border border-slate-200 p-4 text-sm shadow-sm">
              <h3 className="mb-2 text-base font-semibold text-slate-900">Cart Summary</h3>
              <p className="text-sm text-slate-700">{cart.class_title}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-slate-600">Seats</span>
                <button
                  type="button"
                  onClick={() => updateSeatCount(Math.max(1, cart.seat_count - 1))}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                  disabled={loading || !!reservation || cart.seat_count <= 1}
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{cart.seat_count}</span>
                <button
                  type="button"
                  onClick={() => updateSeatCount(cart.seat_count + 1)}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                  disabled={loading || !!reservation}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem();
                    closeCart();
                    resetModalState();
                  }}
                  className="ml-auto rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  disabled={loading || !!reservation}
                >
                  Remove
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                RM {cart.price_per_seat.toFixed(2)} x {cart.seat_count}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Total: RM {courseTotal.toFixed(2)}</p>
            </section>
          )}

          {step === 2 && (
            <>
              <BookingForm values={form} onChange={setForm} disabled={loading || !!reservation} />
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p>}

          {step === 3 && reservation && (
            <section className="space-y-3 rounded-2xl border border-slate-200 p-4 shadow-sm">
              {paymentStatus ? (
                <PaymentSuccessPanel
                  paymentStatus={paymentStatus}
                  summary={{
                    reservationId: reservation.reservation_id,
                    classTitle: cart.class_title,
                    seatCount: cart.seat_count,
                    totalAmount: grandTotal,
                    deliveryMethod: form.delivery_type,
                  }}
                  onGoPortal={() => {
                    window.location.href = "/user/login";
                  }}
                  onBackHome={() => {
                    window.location.href = "/";
                  }}
                />
              ) : (
                <>
                  <p className="text-sm text-slate-700">
                    Reservation ID: <span className="font-semibold">{reservation.reservation_id}</span>
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <p className="font-medium text-emerald-800">Secure Payment Powered by Stripe</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      [ STRIPE ] Your payment is encrypted and protected.
                    </p>
                  </div>
                  {!showManualPayment && (
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
                        disabled={!manualPaymentEnabled}
                        onClick={() => setShowManualPayment(true)}
                        className="rounded-lg border border-slate-700 bg-slate-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        Pay Manually
                      </button>
                    </div>
                  )}

                  {showManualPayment && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-900">Manual Payment</p>
                      {manualPaymentEnabled ? (
                        <>
                          {checkoutSettings?.manual_payment.qr_image_url ? (
                            <img
                              src={checkoutSettings.manual_payment.qr_image_url}
                              alt="Manual payment QR"
                              className="mt-2 h-40 w-40 rounded border object-contain"
                            />
                          ) : (
                            <p className="mt-1 text-xs text-slate-600">QR code not configured yet.</p>
                          )}
                          <p className="mt-2 text-xs text-slate-700">
                            {checkoutSettings?.manual_payment.bank_name || "Bank"} · {checkoutSettings?.manual_payment.account_name || "Account Name"}
                          </p>
                          <p className="text-xs text-slate-700">
                            {checkoutSettings?.manual_payment.account_number || "Account Number"}
                            {checkoutSettings?.manual_payment.bank_code ? ` (${checkoutSettings.manual_payment.bank_code})` : ""}
                          </p>
                          {checkoutSettings?.manual_payment.instructions && (
                            <p className="mt-2 text-xs text-slate-600">{checkoutSettings.manual_payment.instructions}</p>
                          )}
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-slate-600">Manual payment is currently unavailable.</p>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="mt-3 block w-full text-sm"
                        onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                        disabled={!manualPaymentEnabled || loading}
                      />
                      <button
                        type="button"
                        className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
                        onClick={submitManualPayment}
                        disabled={!manualPaymentEnabled || !receipt || loading}
                      >
                        {loading ? "Submitting..." : "Payment Made"}
                      </button>
                    </div>
                  )}
                </>
              )}

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
        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm h-fit">
          <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
          <p className="text-sm text-slate-700">{cart.class_title}</p>
          {pricePerSeat === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Price unavailable, please contact support
            </p>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Price per seat</span>
            <span>RM {pricePerSeat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Seat count</span>
            <span>{cart.seat_count}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Course total</span>
            <span>RM {courseTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery fee</span>
            <span>RM {deliveryFee.toFixed(2)}</span>
          </div>
          {!!checkoutSettings?.delivery.rules && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              {checkoutSettings.delivery.rules}
            </p>
          )}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
            <span>Grand total</span>
            <span>RM {grandTotal.toFixed(2)}</span>
          </div>
        </aside>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
