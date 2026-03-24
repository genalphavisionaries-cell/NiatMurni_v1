"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, type FinanceTimelinePoint } from "@/lib/admin-api";

type TimelinePeriod = "day" | "week" | "month" | "year";

const PERIOD_OPTIONS: TimelinePeriod[] = ["day", "week", "month", "year"];

function toCurrency(cents: number): string {
  return `RM ${(cents / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sumAmountCents(points: FinanceTimelinePoint[]): number {
  return points.reduce((sum, item) => sum + (item.amount_cents || 0), 0);
}

export default function AdminPaymentsPage() {
  const [period, setPeriod] = useState<TimelinePeriod>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<FinanceTimelinePoint[]>([]);
  const [refunds, setRefunds] = useState<FinanceTimelinePoint[]>([]);
  const [payouts, setPayouts] = useState<FinanceTimelinePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [revenueRes, refundsRes, payoutsRes] = await Promise.all([
          adminApi.getRevenueTimeline(period),
          adminApi.getRefundTimeline(period),
          adminApi.getTutorPayoutTimeline(period),
        ]);
        if (cancelled) return;
        setRevenue(revenueRes.data ?? []);
        setRefunds(refundsRes.data ?? []);
        setPayouts(payoutsRes.data ?? []);
      } catch (e) {
        if (!cancelled) {
          setRevenue([]);
          setRefunds([]);
          setPayouts([]);
          setError(e instanceof Error ? e.message : "Failed to load finance data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const totals = useMemo(() => {
    const revenueCents = sumAmountCents(revenue);
    const refundsCents = sumAmountCents(refunds);
    const payoutCents = sumAmountCents(payouts);
    return {
      revenueCents,
      refundsCents,
      payoutCents,
      netCents: revenueCents - refundsCents - payoutCents,
    };
  }, [revenue, refunds, payouts]);

  const timeline = useMemo(() => {
    const map = new Map<string, { revenue: number; refunds: number; payouts: number }>();
    for (const r of revenue) map.set(r.period, { revenue: r.amount_cents || 0, refunds: 0, payouts: 0 });
    for (const r of refunds) {
      const item = map.get(r.period) ?? { revenue: 0, refunds: 0, payouts: 0 };
      item.refunds = r.amount_cents || 0;
      map.set(r.period, item);
    }
    for (const p of payouts) {
      const item = map.get(p.period) ?? { revenue: 0, refunds: 0, payouts: 0 };
      item.payouts = p.amount_cents || 0;
      map.set(p.period, item);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, values]) => ({ label, ...values }));
  }, [revenue, refunds, payouts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Revenue, refunds, and tutor payouts from Laravel finance APIs</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as TimelinePeriod)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Gross Revenue" value={loading ? "Loading..." : toCurrency(totals.revenueCents)} />
        <MetricCard title="Refunds" value={loading ? "Loading..." : toCurrency(totals.refundsCents)} />
        <MetricCard title="Tutor Payouts" value={loading ? "Loading..." : toCurrency(totals.payoutCents)} />
        <MetricCard title="Net" value={loading ? "Loading..." : toCurrency(totals.netCents)} />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Finance Timeline</h2>
        <p className="mt-1 text-sm text-gray-500">Aggregated by selected period</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-gray-500">
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Revenue</th>
                <th className="pb-3 font-medium">Refunds</th>
                <th className="pb-3 font-medium">Payouts</th>
                <th className="pb-3 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={5}>
                    Loading finance timeline...
                  </td>
                </tr>
              ) : timeline.length === 0 ? (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={5}>
                    No finance data for selected period.
                  </td>
                </tr>
              ) : (
                timeline.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)]/50">
                    <td className="py-3 text-gray-900">{row.label}</td>
                    <td className="py-3 text-gray-700">{toCurrency(row.revenue)}</td>
                    <td className="py-3 text-gray-700">{toCurrency(row.refunds)}</td>
                    <td className="py-3 text-gray-700">{toCurrency(row.payouts)}</td>
                    <td className="py-3 text-gray-900">{toCurrency(row.revenue - row.refunds - row.payouts)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
