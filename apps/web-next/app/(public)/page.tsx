"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";

export default function HomePage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("");
  const [language, setLanguage] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUpcomingClasses({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      mode: mode || undefined,
      language: language || undefined,
    })
      .then((list) => {
        if (!cancelled) setClasses(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, language, fromDate, toDate]);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-stone-900">Niat Murni — KKM Food Handling</h1>
        <p className="text-sm text-stone-500 mt-0.5">Upcoming classes. No login required to browse.</p>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center gap-2">
            <span className="text-sm text-stone-600">From date</span>
            <input
              type="date"
              className="rounded border border-stone-300 px-3 py-1.5 text-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-stone-600">To date</span>
            <input
              type="date"
              className="rounded border border-stone-300 px-3 py-1.5 text-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Mode</span>
            <select
              className="rounded border border-stone-300 px-3 py-1.5 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="">All</option>
              <option value="online">Online</option>
              <option value="physical">Physical</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Language</span>
            <input
              type="text"
              className="rounded border border-stone-300 px-3 py-1.5 text-sm w-32"
              placeholder="e.g. BM"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <p className="text-stone-500">Loading classes…</p>
        ) : classes.length === 0 ? (
          <p className="text-stone-500">No upcoming classes found.</p>
        ) : (
          <ul className="space-y-4">
            {classes.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium text-stone-900">{c.program_name}</h2>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {new Date(c.starts_at).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {c.mode}
                      {c.trainer_name ? ` · ${c.trainer_name}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/classes/${c.id}`}
                    className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    View & Register
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="max-w-4xl mx-auto px-6 py-4 text-center text-sm text-stone-500">
        <Link href="/my-booking" className="text-amber-600 hover:underline">View my booking</Link> (enter booking ID)
      </footer>
    </main>
  );
}
