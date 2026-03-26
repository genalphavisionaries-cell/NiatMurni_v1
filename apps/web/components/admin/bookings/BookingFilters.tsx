"use client";

import { useEffect, useMemo, useState } from "react";

export type BookingFilterState = {
  status: string;
  paymentMethod: string; // stripe/manual
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  search: string;
};

type Props = {
  value: BookingFilterState;
  onChange: (next: BookingFilterState) => void;
};

export default function BookingFilters({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const hasFilters = useMemo(() => {
    return Boolean(local.status || local.paymentMethod || local.from || local.to || local.search);
  }, [local]);

  const apply = () => onChange(local);
  const reset = () =>
    onChange({
      status: "",
      paymentMethod: "",
      from: "",
      to: "",
      search: "",
    });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Booking Status</label>
          <select
            value={local.status}
            onChange={(e) => setLocal((p) => ({ ...p, status: e.target.value }))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">Payment Method</label>
          <select
            value={local.paymentMethod}
            onChange={(e) => setLocal((p) => ({ ...p, paymentMethod: e.target.value }))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="stripe">Stripe</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            value={local.from}
            onChange={(e) => setLocal((p) => ({ ...p, from: e.target.value }))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            value={local.to}
            onChange={(e) => setLocal((p) => ({ ...p, to: e.target.value }))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-gray-500">Search</label>
          <input
            value={local.search}
            onChange={(e) => setLocal((p) => ({ ...p, search: e.target.value }))}
            placeholder="Name / IC / phone"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-gray-500">{hasFilters ? "Filters applied on load." : "No filters applied."}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

