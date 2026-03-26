"use client";

import { useEffect, useState } from "react";
import { adminApi, type Booking } from "@/lib/admin-api";
import BookingFilters, { type BookingFilterState } from "@/components/admin/bookings/BookingFilters";
import BookingTable from "@/components/admin/bookings/BookingTable";

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookingFilterState>({
    status: "",
    paymentMethod: "",
    from: "",
    to: "",
    search: "",
  });

  const load = async (nextFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        status?: string;
        payment_method?: string;
        from?: string;
        to?: string;
        search?: string;
        per_page?: number;
      } = { per_page: 20 };
      if (nextFilters.status) params.status = nextFilters.status;
      if (nextFilters.paymentMethod) params.payment_method = nextFilters.paymentMethod;
      if (nextFilters.from) params.from = nextFilters.from;
      if (nextFilters.to) params.to = nextFilters.to;
      if (nextFilters.search) params.search = nextFilters.search;
      const res = await adminApi.getBookings(params);
      setBookings(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage bookings, payments, refunds and certificates.</p>
      </div>

      <BookingFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          load(next).catch(() => undefined);
        }}
      />

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
          Loading…
        </div>
      ) : (
        <BookingTable bookings={bookings} loading={loading} onRefresh={() => load().catch(() => undefined)} />
      )}
    </div>
  );
}
