"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";

export default function UpcomingClassesSection() {
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
    <section id="classes" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Upcoming Classes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            Book your seat for the next available sessions. Online and physical options available.
          </p>
        </div>
        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : classes.length === 0 ? (
            <p className="text-center text-stone-500 py-12">
              No upcoming classes at the moment. Check back soon.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="font-semibold text-stone-900">{c.program_name}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {new Date(c.starts_at).toLocaleString("en-MY", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {c.mode}
                  </p>
                  {c.trainer_name && (
                    <p className="mt-0.5 text-sm text-stone-500">{c.trainer_name}</p>
                  )}
                  <Link
                    href={`/class/${c.id}`}
                    className="mt-4 inline-flex w-fit rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    View & Register
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && classes.length > 0 && (
          <p className="mt-6 text-center">
            <Link href="/#classes" className="text-amber-600 font-medium hover:underline">
              View all classes
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
