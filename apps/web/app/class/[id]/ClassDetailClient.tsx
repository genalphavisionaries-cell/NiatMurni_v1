"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchClass, type ClassSession } from "@/lib/api";

type Props = { id: string };

export default function ClassDetailClient({ id }: Props) {
  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchClass(id)
      .then((c) => {
        if (!cancelled) setClassSession(c);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 p-8">
        <p className="text-stone-500">Loading…</p>
      </main>
    );
  }

  if (!classSession) {
    return (
      <main className="min-h-screen bg-stone-50 p-8">
        <p className="text-stone-500">Class not found.</p>
        <Link href="/" className="text-amber-600 hover:underline mt-2 inline-block">
          ← Back to home
        </Link>
      </main>
    );
  }

  const start = new Date(classSession.starts_at);
  const end = new Date(classSession.ends_at);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <Link
          href="/"
          className="text-sm text-amber-600 hover:underline"
        >
          ← Back to classes
        </Link>
        <h1 className="text-xl font-semibold text-stone-900 mt-2">
          {classSession.program_name}
        </h1>
      </header>

      <section className="max-w-2xl mx-auto px-6 py-8">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <p>
            <span className="text-stone-500">Date & time:</span>{" "}
            {start.toLocaleString("en-MY", {
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            – {end.toLocaleTimeString("en-MY", { timeStyle: "short" })}
          </p>
          <p>
            <span className="text-stone-500">Mode:</span> {classSession.mode}
          </p>
          {classSession.trainer_name && (
            <p>
              <span className="text-stone-500">Trainer:</span>{" "}
              {classSession.trainer_name}
            </p>
          )}
          {classSession.language && (
            <p>
              <span className="text-stone-500">Language:</span>{" "}
              {classSession.language}
            </p>
          )}
          {classSession.venue && (
            <p>
              <span className="text-stone-500">Venue:</span>{" "}
              {classSession.venue}
            </p>
          )}
          <p>
            <span className="text-stone-500">Capacity:</span>{" "}
            {classSession.capacity}
          </p>
        </div>

        <div className="mt-8">
          <Link
            href={`/class/${id}/register`}
            className="inline-block rounded bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
          >
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
