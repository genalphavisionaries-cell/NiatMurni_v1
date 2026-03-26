"use client";

import { useEffect, useMemo, useState } from "react";
import { BookingCard } from "@/components/dashboard-bookings/BookingCard";
import { getParticipantBookings, type ParticipantBookingListItem } from "@/lib/api";

type Tab = "upcoming" | "past";

function isUpcoming(date: string | null): boolean {
  if (!date) return false;
  const today = new Date();
  const d = new Date(`${date}T00:00:00`);
  return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export default function DashboardBookingsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ParticipantBookingListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await getParticipantBookings();
        if (cancelled) return;
        setItems(rows);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load bookings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => items.filter((b) => (tab === "upcoming" ? isUpcoming(b.class_date) : !isUpcoming(b.class_date))),
    [items, tab]
  );

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">My Bookings</h2>
        <p className="mt-1 text-sm text-slate-600">Track your upcoming and past class bookings.</p>
      </div>

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("upcoming")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "upcoming" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "past" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Past
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No {tab} bookings found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

