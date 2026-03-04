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
    <section id="classes" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Upcoming classes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Book your seat for the next available sessions. Online and physical options available.
          </p>
        </div>
        <div className="mt-14">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-surface py-16 text-center">
              <p className="text-slate-600">No upcoming classes at the moment. Check back soon.</p>
              <Link
                href="#contact"
                className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Contact us for enquiries
              </Link>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
                >
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {c.mode}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{c.program_name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(c.starts_at).toLocaleString("en-MY", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {c.trainer_name && (
                    <p className="mt-0.5 text-sm text-slate-500">{c.trainer_name}</p>
                  )}
                  <Link
                    href={`/class/${c.id}`}
                    className="mt-5 inline-flex w-fit rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 active:scale-[0.98]"
                  >
                    View & register
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!loading && classes.length > 0 && (
          <p className="mt-8 text-center">
            <Link
              href="/#classes"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View all classes →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
