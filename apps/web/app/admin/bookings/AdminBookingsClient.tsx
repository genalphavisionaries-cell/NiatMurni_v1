"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type Booking } from "@/lib/admin-api";
import { DataTable } from "@/components/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; payment_status?: string; per_page?: number } = { per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      const res = await adminApi.getBookings(params);
      setBookings(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, paymentFilter]);

  const columns: ColumnDef<Booking>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "booking_reference",
      header: "Reference",
      cell: ({ row }) => row.original.booking_reference ?? "—",
    },
    {
      accessorKey: "participant",
      header: "Participant",
      cell: ({ row }) => row.original.participant?.full_name ?? "—",
    },
    {
      accessorKey: "class_session",
      header: "Class",
      cell: ({ row }) => row.original.class_session?.program?.name ?? "—",
    },
    {
      accessorKey: "class_session",
      header: "Starts",
      cell: ({ row }) =>
        row.original.class_session?.starts_at
          ? new Date(row.original.class_session.starts_at).toLocaleString()
          : "—",
    },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }) => row.original.payment_status ?? "—",
    },
    {
      accessorKey: "payment_amount",
      header: "Amount",
      cell: ({ row }) => (row.original.payment_amount ? `RM ${row.original.payment_amount}` : "—"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/booking/${row.original.id}`}
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Sales and registrations. Filter and manage booking status.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Payment</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <DataTable data={bookings} columns={columns} />
      )}
    </div>
  );
}
