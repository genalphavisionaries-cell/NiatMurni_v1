"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";
import ClassCard from "@/components/home/hero/ClassCard";
import {
  MOCK_HERO_CLASSES,
  getRecommendedClasses,
  type HeroClassItem,
  type LanguageFilter,
} from "@/components/home/hero/hero-classes";

/** Map API class to hero-style item for ClassCard */
function toHeroItem(c: ClassSession): HeroClassItem {
  const starts = new Date(c.starts_at);
  const ends = new Date(c.ends_at);
  const dayNames = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
  const dateStr = starts.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, " ");
  const timeStr = starts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
    + " – "
    + ends.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  return {
    id: String(c.id),
    date: dateStr,
    dateSort: c.starts_at.slice(0, 10),
    day: dayNames[starts.getDay()],
    time: timeStr,
    slots: c.capacity ?? 15,
    mode: c.mode === "online" ? "Online" : "Physical",
    language: c.language ?? "B. Melayu",
  };
}

const DEMO_CLASSES = MOCK_HERO_CLASSES;
const DEMO_LIMIT = 6;

export default function UpcomingClassesSection() {
  const [apiClasses, setApiClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUpcomingClasses()
      .then((list) => {
        if (!cancelled) setApiClasses(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const useDemo = !loading && apiClasses.length === 0;
  const displayList: HeroClassItem[] = useDemo
    ? DEMO_CLASSES.slice(0, DEMO_LIMIT)
    : apiClasses.slice(0, DEMO_LIMIT).map(toHeroItem);
  const firstRecommendedId = useDemo
    ? getRecommendedClasses(DEMO_CLASSES, "" as LanguageFilter, 1)[0]?.id
    : displayList[0]?.id;

  return (
    <section id="classes" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Upcoming classes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#64748B]">
            Book your seat for the next available sessions. Online and physical options available.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {displayList.map((c) => {
                  const isNext = firstRecommendedId === c.id;
                  return (
                    <li key={c.id}>
                      <ClassCard item={c} isNextAvailable={isNext} />
                    </li>
                  );
                })}
              </ul>
              {useDemo && (
                <p className="mt-6 text-center text-sm text-[#64748B]">
                  Demo content.{" "}
                  <Link href="#contact" className="font-medium text-[#2563EB] hover:underline">
                    Contact us for enquiries
                  </Link>
                </p>
              )}
              {!useDemo && displayList.length > 0 && (
                <p className="mt-6 text-center">
                  <Link
                    href="#classes"
                    className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    View all classes →
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
