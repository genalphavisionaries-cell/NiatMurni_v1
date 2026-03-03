"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchBooking, fetchClass } from "@/lib/api";

export default function BookingPage() {
  const params = useParams();
  const id = params.id as string;
  const [booking, setBooking] = useState<Awaited<
    ReturnType<typeof fetchBooking>
  > | null>(null);
  const [classSession, setClassSession] = useState<Awaited<
    ReturnType<typeof fetchClass>
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setBooking(null);
    setClassSession(null);
    fetchBooking(id)
      .then((b) => {
        if (cancelled) return;
        setBooking(b);
        if (b?.booking?.class_session_id) {
          return fetchClass(String(b.booking.class_session_id));
        }
        return null;
      })
      .then((c) => {
        if (!cancelled && c) setClassSession(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <Link href="/" className="text-sm text-amber-600 hover:underline">
          ← Home
        </Link>
        <h1 className="text-xl font-semibold text-stone-900 mt-2">
          Booking status
        </h1>
      </header>

      <section className="max-w-md mx-auto px-6 py-8">
        {loading ? (
          <p className="text-stone-500">Loading…</p>
        ) : !id ? (
          <p className="text-stone-500">Invalid booking.</p>
        ) : !booking ? (
          <p className="text-stone-500">Booking not found.</p>
        ) : (
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-3">
            <p>
              <span className="text-stone-500">Status:</span>{" "}
              <span className="font-medium capitalize">{booking.status}</span>
            </p>
            {classSession && (
              <>
                <p>
                  <span className="text-stone-500">Class:</span>{" "}
                  {classSession.program_name}
                </p>
                <p>
                  <span className="text-stone-500">Date:</span>{" "}
                  {new Date(classSession.starts_at).toLocaleString("en-MY", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                {classSession.mode === "online" && classSession.zoom_join_url && (
                  <p>
                    <a
                      href={classSession.zoom_join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
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
