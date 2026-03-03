"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";

export default function HomePage() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUpcomingClasses()
      .then((list) => {
        if (!cancelled) setClasses(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-stone-900">
          Niat Murni Academy
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Upcoming classes
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-8">
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
                    <h2 className="font-medium text-stone-900">
                      {c.program_name}
                    </h2>
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
                    href={`/class/${c.id}`}
                    className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
