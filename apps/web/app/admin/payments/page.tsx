"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, type AdminPaymentDeliverySettings, type FinanceTimelinePoint } from "@/lib/admin-api";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<FinanceTimelinePoint[]>([]);
  const [refunds, setRefunds] = useState<FinanceTimelinePoint[]>([]);
  const [payouts, setPayouts] = useState<FinanceTimelinePoint[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [paymentDeliverySettings, setPaymentDeliverySettings] = useState<AdminPaymentDeliverySettings>({
    delivery: {
      normal: { enabled: true, fee: 10 },
      fast: { enabled: true, fee: 20 },
      rules: "",
    },
    manual_payment: {
      enabled: true,
      methods: ["bank_transfer", "qr", "cash"],
      qr_image_url: "",
      account_name: "",
      bank_name: "",
      account_number: "",
      bank_code: "",
      instructions: "",
    },
    success_paid_message: "",
    success_pending_message: "",
    manual_payment_notes: "",
    portal_instruction: "",
  });
  const [qrFile, setQrFile] = useState<File | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    const runSettings = async () => {
      setSettingsLoading(true);
      try {
        const settingsRes = await adminApi.getPaymentDeliverySettings();
        if (!cancelled) {
          setPaymentDeliverySettings(settingsRes.data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load payment/delivery settings");
        }
      } finally {
        if (!cancelled) {
          setSettingsLoading(false);
        }
      }
    };
    void runSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const savePaymentDeliverySettings = async () => {
    setError(null);
    setSuccess(null);
    setSettingsSaving(true);
    try {
      let res: { data: AdminPaymentDeliverySettings };
      if (qrFile) {
        const form = new FormData();
        form.set("delivery[normal][enabled]", String(paymentDeliverySettings.delivery.normal.enabled));
        form.set("delivery[normal][fee]", String(paymentDeliverySettings.delivery.normal.fee));
        form.set("delivery[fast][enabled]", String(paymentDeliverySettings.delivery.fast.enabled));
        form.set("delivery[fast][fee]", String(paymentDeliverySettings.delivery.fast.fee));
        form.set("delivery[rules]", paymentDeliverySettings.delivery.rules ?? "");
        form.set("manual_payment[enabled]", String(paymentDeliverySettings.manual_payment.enabled));
        paymentDeliverySettings.manual_payment.methods.forEach((method, index) => {
          form.set(`manual_payment[methods][${index}]`, method);
        });
        form.set("manual_payment[qr_image_url]", paymentDeliverySettings.manual_payment.qr_image_url ?? "");
        form.set("manual_payment[account_name]", paymentDeliverySettings.manual_payment.account_name ?? "");
        form.set("manual_payment[bank_name]", paymentDeliverySettings.manual_payment.bank_name ?? "");
        form.set("manual_payment[account_number]", paymentDeliverySettings.manual_payment.account_number ?? "");
        form.set("manual_payment[bank_code]", paymentDeliverySettings.manual_payment.bank_code ?? "");
        form.set("manual_payment[instructions]", paymentDeliverySettings.manual_payment.instructions ?? "");
        form.set("success_paid_message", paymentDeliverySettings.success_paid_message ?? "");
        form.set("success_pending_message", paymentDeliverySettings.success_pending_message ?? "");
        form.set("manual_payment_notes", paymentDeliverySettings.manual_payment_notes ?? "");
        form.set("portal_instruction", paymentDeliverySettings.portal_instruction ?? "");
        form.set("manual_payment[qr_image]", qrFile);
        res = await adminApi.updatePaymentDeliverySettings(form);
      } else {
        res = await adminApi.updatePaymentDeliverySettings(paymentDeliverySettings);
      }
      setPaymentDeliverySettings(res.data);
      setQrFile(null);
      setSuccess("Payments & delivery settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save payment/delivery settings");
    } finally {
      setSettingsSaving(false);
    }
  };

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
      {success && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

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

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payments & Delivery Controls</h2>
          <p className="mt-1 text-sm text-gray-500">Configure delivery options, fees, rules, and manual payment details.</p>
        </div>
        {settingsLoading ? (
          <p className="text-sm text-gray-500">Loading settings...</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Normal Delivery</p>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentDeliverySettings.delivery.normal.enabled}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        delivery: { ...prev.delivery, normal: { ...prev.delivery.normal, enabled: e.target.checked } },
                      }))
                    }
                  />
                  Enabled
                </label>
                <label className="block text-sm text-gray-700">
                  Fee (RM)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentDeliverySettings.delivery.normal.fee}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        delivery: { ...prev.delivery, normal: { ...prev.delivery.normal, fee: Number(e.target.value) || 0 } },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Fast Delivery</p>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentDeliverySettings.delivery.fast.enabled}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        delivery: { ...prev.delivery, fast: { ...prev.delivery.fast, enabled: e.target.checked } },
                      }))
                    }
                  />
                  Enabled
                </label>
                <label className="block text-sm text-gray-700">
                  Fee (RM)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentDeliverySettings.delivery.fast.fee}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        delivery: { ...prev.delivery, fast: { ...prev.delivery.fast, fee: Number(e.target.value) || 0 } },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            <label className="block text-sm text-gray-700">
              Delivery Rules
              <textarea
                value={paymentDeliverySettings.delivery.rules}
                onChange={(e) =>
                  setPaymentDeliverySettings((prev) => ({
                    ...prev,
                    delivery: { ...prev.delivery, rules: e.target.value },
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. East Malaysia surcharge, delivery lead time, cutoff times"
              />
            </label>

            <div className="rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Manual Payment Details</p>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentDeliverySettings.manual_payment.enabled}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        manual_payment: { ...prev.manual_payment, enabled: e.target.checked },
                      }))
                    }
                  />
                  Enabled
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-gray-700">
                  Account Name
                  <input
                    type="text"
                    value={paymentDeliverySettings.manual_payment.account_name}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        manual_payment: { ...prev.manual_payment, account_name: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Bank Name
                  <input
                    type="text"
                    value={paymentDeliverySettings.manual_payment.bank_name}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        manual_payment: { ...prev.manual_payment, bank_name: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Account Number
                  <input
                    type="text"
                    value={paymentDeliverySettings.manual_payment.account_number}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        manual_payment: { ...prev.manual_payment, account_number: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm text-gray-700">
                  Bank Code / Reference
                  <input
                    type="text"
                    value={paymentDeliverySettings.manual_payment.bank_code}
                    onChange={(e) =>
                      setPaymentDeliverySettings((prev) => ({
                        ...prev,
                        manual_payment: { ...prev.manual_payment, bank_code: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm text-gray-700">
                QR Image URL
                <input
                  type="url"
                  value={paymentDeliverySettings.manual_payment.qr_image_url}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({
                      ...prev,
                      manual_payment: { ...prev.manual_payment, qr_image_url: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </label>
              <label className="block text-sm text-gray-700">
                Upload QR Image (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">Allowed Manual Methods</legend>
                {(["bank_transfer", "qr", "cash"] as const).map((method) => (
                  <label key={method} className="mr-4 inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={paymentDeliverySettings.manual_payment.methods.includes(method)}
                      onChange={(e) =>
                        setPaymentDeliverySettings((prev) => {
                          const next = e.target.checked
                            ? [...prev.manual_payment.methods, method]
                            : prev.manual_payment.methods.filter((m) => m !== method);
                          return { ...prev, manual_payment: { ...prev.manual_payment, methods: next } };
                        })
                      }
                    />
                    {method}
                  </label>
                ))}
              </fieldset>

              <label className="block text-sm text-gray-700">
                Instructions
                <textarea
                  value={paymentDeliverySettings.manual_payment.instructions}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({
                      ...prev,
                      manual_payment: { ...prev.manual_payment, instructions: e.target.value },
                    }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Tell users how to transfer and what reference to include."
                />
              </label>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Checkout Success Messages</p>
              <label className="block text-sm text-gray-700">
                Paid Success Message
                <textarea
                  value={paymentDeliverySettings.success_paid_message}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({ ...prev, success_paid_message: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Pending Verification Message
                <textarea
                  value={paymentDeliverySettings.success_pending_message}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({ ...prev, success_pending_message: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Manual Payment Notes
                <textarea
                  value={paymentDeliverySettings.manual_payment_notes}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({ ...prev, manual_payment_notes: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm text-gray-700">
                Portal Instruction
                <textarea
                  value={paymentDeliverySettings.portal_instruction}
                  onChange={(e) =>
                    setPaymentDeliverySettings((prev) => ({ ...prev, portal_instruction: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void savePaymentDeliverySettings()}
                disabled={settingsSaving || paymentDeliverySettings.manual_payment.methods.length === 0}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {settingsSaving ? "Saving..." : "Save Payments & Delivery"}
              </button>
            </div>
          </>
        )}
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
