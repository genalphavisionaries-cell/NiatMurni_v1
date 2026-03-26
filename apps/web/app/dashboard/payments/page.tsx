"use client";

import { useEffect, useState } from "react";
import { getParticipantPayments, type ParticipantPayment } from "@/lib/api";
import { PaymentCard } from "@/components/dashboard-payments/PaymentCard";

export default function DashboardPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParticipantPayment[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getParticipantPayments();
        if (cancelled) return;
        setItems(rows);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load payments.");
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
        <h2 className="text-lg font-semibold text-slate-900">My Payments</h2>
        <p className="mt-1 text-sm text-slate-600">Track all your payment records and receipts.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No payment records found.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <PaymentCard key={item.id} payment={item} />
          ))}
        </div>
      )}
    </section>
  );
}

