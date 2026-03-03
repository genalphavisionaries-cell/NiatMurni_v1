"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchBookingStatus, fetchClass } from "@/lib/api";

export default function MyBookingPage() {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Awaited<ReturnType<typeof fetchBookingStatus>>>(null);
  const [classSession, setClassSession] = useState<Awaited<ReturnType<typeof fetchClass>>>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(bookingId);
    if (!id) return;
    setLoading(true);
    setBooking(null);
    setClassSession(null);
    try {
      const b = await fetchBookingStatus(id);
      setBooking(b);
      if (b?.booking?.class_session_id) {
        const c = await fetchClass(b.booking.class_session_id);
        setClassSession(c);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <Link href="/" className="text-sm text-amber-600 hover:underline">← Home</Link>
        <h1 className="text-xl font-semibold text-stone-900 mt-2">View my booking</h1>
        <p className="text-sm text-stone-500 mt-0.5">Enter your booking ID (e.g. from confirmation).</p>
      </header>

      <section className="max-w-md mx-auto px-6 py-8">
        <form onSubmit={handleLookup} className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Booking ID</span>
            <input
              type="number"
              min={1}
              className="mt-1 block w-full rounded border border-stone-300 px-3 py-2 text-sm"
              placeholder="e.g. 1"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Looking up…" : "View status"}
          </button>
        </form>

        {booking && (
          <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-3">
            <p><span className="text-stone-500">Status:</span> <span className="font-medium capitalize">{booking.status}</span></p>
            {classSession && (
              <>
                <p><span className="text-stone-500">Class:</span> {classSession.program_name}</p>
                <p><span className="text-stone-500">Date:</span> {new Date(classSession.starts_at).toLocaleString("en-MY", { dateStyle: "long", timeStyle: "short" })}</p>
                {classSession.mode === "online" && classSession.zoom_join_url && (
                  <p>
                    <a href={classSession.zoom_join_url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                      Join Zoom meeting →
                    </a>
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
