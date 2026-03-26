"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";
import QuantitySelector from "@/components/home/QuantitySelector";
import { useCart } from "@/components/cart/CartProvider";

type HeroClassItem = {
  id: string;
  date: string;
  dateSort: string;
  day: string;
  time: string;
  slots: number;
  mode: string;
  language: string;
  price_per_seat: number;
};

function formatClassDate(dateStr: string) {
  const parts = dateStr.split(" ");
  if (parts.length >= 3) {
    return {
      dayNumber: parts[0],
      month: parts[1],
      year: parts.slice(2).join(" "),
    };
  }
  return { dayNumber: dateStr, month: "", year: "" };
}

/**
 * Canonical display labels for language.
 * Official values: English, Bahasa Melayu, Chinese, Tamil
 * Maps legacy/stored values safely — old DB records are not broken.
 */
function languageLabel(lang: string): string {
  const map: Record<string, string> = {
    // canonical (new)
    English: "English",
    "Bahasa Melayu": "Bahasa Melayu",
    Chinese: "Chinese",
    Tamil: "Tamil",
    // legacy aliases (backward-safe)
    "B. Melayu": "Bahasa Melayu",
    Malay: "Bahasa Melayu",
    Mandarin: "Chinese",
  };
  return map[lang] ?? lang;
}

/**
 * Canonical display labels for mode of delivery.
 * Official values: Online (Zoom), Physical (Classroom)
 * Maps legacy stored values safely.
 */
function modeLabel(mode: string): string {
  const map: Record<string, string> = {
    // canonical (new)
    "online": "Online (Zoom)",
    "physical": "Physical (Classroom)",
    // legacy display values (backward-safe)
    Online: "Online (Zoom)",
    Physical: "Physical (Classroom)",
    Bersemuka: "Physical (Classroom)",
  };
  return map[mode] ?? mode;
}

function toMalayMonthShort(month: string) {
  const m = month.trim().toLowerCase();
  const map: Record<string, string> = {
    jan: "Jan",
    feb: "Feb",
    mar: "Mac",
    apr: "Apr",
    may: "Mei",
    jun: "Jun",
    jul: "Jul",
    aug: "Ogos",
    sep: "Sep",
    oct: "Okt",
    nov: "Nov",
    dec: "Dis",
  };

  const key = m.slice(0, 3);
  return map[key] ?? month;
}

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
    mode: c.mode ?? "online", // pass raw value; modeLabel() normalises on display
    language: c.language ?? "B. Melayu",
    price_per_seat: Number(c.price_per_seat ?? c.price ?? 0),
  };
}

const MAX_CLASSES = 30;
// Desktop: 7 rows × 3 columns = 21 initial, then +10 per Load More
const DESKTOP_INITIAL = 21;
const DESKTOP_INCREMENT = 10;
// Mobile: 10 initial, then +6 per Load More
const MOBILE_INITIAL = 10;
const MOBILE_INCREMENT = 6;

export default function UpcomingClassesSection() {
  const [apiClasses, setApiClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  // separate visible-count state for mobile and desktop
  const [mobileVisible, setMobileVisible] = useState(MOBILE_INITIAL);
  const [desktopVisible, setDesktopVisible] = useState(DESKTOP_INITIAL);

  const { addToCart } = useCart();

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

  const displayList: HeroClassItem[] = useMemo(() => {
    return apiClasses.map(toHeroItem).slice(0, MAX_CLASSES);
  }, [apiClasses]);

  const firstRecommendedId = displayList[0]?.id;

  // Slice the full list by the current visible counts
  const desktopList = useMemo(
    () => displayList.slice(0, desktopVisible),
    [displayList, desktopVisible]
  );
  const desktopColumns = useMemo(() => {
    // round-robin distribution into 3 columns
    const cols: [HeroClassItem[], HeroClassItem[], HeroClassItem[]] = [[], [], []];
    desktopList.forEach((item, i) => cols[i % 3].push(item));
    return cols;
  }, [desktopList]);

  const mobileList = useMemo(
    () => displayList.slice(0, mobileVisible),
    [displayList, mobileVisible]
  );

  const classById = useMemo(() => {
    const map = new Map<string, ClassSession>();
    apiClasses.forEach((c) => map.set(String(c.id), c));
    return map;
  }, [apiClasses]);

  return (
    <section id="classes" className="scroll-mt-20 bg-[#EFF6FF] py-16 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Kelas Terkini
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#64748B]">
            Daftar untuk sesi seterusnya. Online dan bersemuka tersedia.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
            </div>
          ) : (
            <>
              {displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="mb-4 h-12 w-12 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-base font-semibold text-[#0F172A]">Tiada kelas dijadualkan buat masa ini.</p>
                  <p className="mt-1 text-sm text-[#64748B]">Sila semak semula kemudian atau hubungi kami untuk maklumat lanjut.</p>
                </div>
              ) : (
                <>
                  {/* Mobile list */}
                  <div className="space-y-1.5 md:hidden">
                    {mobileList.map((c) => (
                      <UpcomingClassCard
                        key={c.id}
                        item={c}
                        isNext={firstRecommendedId === c.id}
                        onAddToCart={(qty) => {
                          if (qty <= 0) return;
                          const classSession = classById.get(c.id);
                          if (!classSession) return;
                          addToCart(
                            {
                              class_session_id: classSession.id,
                              class_title: classSession.program_name,
                              price_per_seat: classSession.price_per_seat ?? classSession.price ?? 0,
                            },
                            qty
                          );
                        }}
                      />
                    ))}
                  </div>

                  {/* Desktop 3-column grid */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-3 gap-4">
                      {desktopColumns.map((col, colIdx) => (
                        <div key={colIdx} className="space-y-1.5">
                          {col.map((c) => (
                            <UpcomingClassCard
                              key={c.id}
                              item={c}
                              isNext={firstRecommendedId === c.id}
                              onAddToCart={(qty) => {
                                if (qty <= 0) return;
                                const classSession = classById.get(c.id);
                                if (!classSession) return;
                                addToCart(
                                  {
                                    class_session_id: classSession.id,
                                    class_title: classSession.program_name,
                                    price_per_seat: classSession.price_per_seat ?? classSession.price ?? 0,
                                  },
                                  qty
                                );
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Load More */}
              {!loading && mobileList.length < displayList.length ? (
                <div className="mt-5 flex justify-center md:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileVisible((v) =>
                        Math.min(v + MOBILE_INCREMENT, displayList.length)
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-6 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  >
                    <span>Load More</span>
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ) : null}

              {/* Desktop Load More */}
              {!loading && desktopList.length < displayList.length ? (
                <div className="mt-6 hidden justify-center md:flex">
                  <button
                    type="button"
                    onClick={() =>
                      setDesktopVisible((v) =>
                        Math.min(v + DESKTOP_INCREMENT, displayList.length)
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white px-7 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  >
                    <span>Load More</span>
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ) : null}

              {/* Secondary CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
                <Link
                  href="/#classes"
                  className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
                >
                  Pilih Kelas Lain
                </Link>
                <div className="hidden text-xs text-[#64748B] md:block">
                  * Selepas proceed, anda akan terus ke checkout popup.
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </section>
  );
}

function UpcomingClassCard({
  item,
  isNext: _isNext,
  onAddToCart,
}: {
  item: HeroClassItem;
  isNext: boolean;
  onAddToCart: (qty: number) => void;
}) {
  const [qty, setQty] = useState(0);
  const seatsLeft = item.slots ?? 0;
  const max = Math.max(0, seatsLeft);
  const disabled = seatsLeft <= 0 || qty <= 0;
  const { dayNumber, month, year } = formatClassDate(item.date);
  const timeText = item.time.replace(/\s*–\s*/g, " – ");
  const monthShort = month ? toMalayMonthShort(month) : "";
  const dateLine = `${dayNumber}${monthShort ? ` ${monthShort}` : ""}${
    year ? ` ${year}` : ""
  }`.trim();
  const dateAndDayLine = `${dateLine}, ${item.day}`.replace(/\s+/g, " ").trim();

  const resolvedMode = modeLabel(item.mode);
  const isOnline = resolvedMode === "Online (Zoom)";
  const modePill = resolvedMode;
  const languagePill = languageLabel(item.language);
  const showNearFull = seatsLeft > 0 && seatsLeft <= 14;

  const seatColor = seatsLeft <= 5 ? "text-red-500" : seatsLeft <= 10 ? "text-orange-500" : "text-gray-700";

  return (
    <div className="rounded-xl border border-[#D1D5DB] bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* 2-COLUMN: left = date anchor + chips | right = seat + action */}
      <div className="flex items-stretch gap-3">

        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">

          {/* DATE/TIME ANCHOR — subtle tinted block with blue left accent */}
          <div className="rounded-md border-l-[3px] border-[#2563EB] bg-slate-50 px-2 py-1">
            <p className="text-[15px] font-extrabold leading-snug text-[#0A1628] break-words">
              {dateAndDayLine}
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-tight text-[#6B7280]">
              {timeText}
            </p>
            <p className="mt-1 text-sm font-semibold text-blue-700">RM {item.price_per_seat.toFixed(2)} / seat</p>
          </div>

          {/* CHIPS — below the date anchor */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold leading-none text-[#3B82F6]">
              {isOnline ? (
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]"
                  aria-hidden
                />
              ) : null}
              {modePill}
            </span>
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium leading-none text-[#6B7280]">
              {languagePill}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: seat block (top) + action (bottom) */}
        <div className="flex shrink-0 flex-col items-end justify-between gap-1.5">

          {/* Seat block — toned-down label, strong number */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
              Kekosongan
            </span>
            <span className={`text-[16px] font-bold leading-none tabular-nums ${seatColor}`}>
              {seatsLeft}
            </span>
            {showNearFull ? (
              <span className="mt-0.5 rounded px-1.5 py-px text-[9px] font-medium leading-none text-orange-400">
                Almost Full
              </span>
            ) : null}
          </div>

          {/* Action: qty + Daftar */}
          <div className="flex items-center gap-1.5">
            <div className="scale-[0.88] origin-right">
              <QuantitySelector
                compact
                min={0}
                max={max}
                defaultValue={0}
                onChange={(n) => setQty(n)}
              />
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onAddToCart(qty);
              }}
              className={`inline-flex h-[30px] min-w-[5.75rem] shrink-0 items-center justify-center rounded-md px-2 text-[12px] font-bold leading-none shadow-sm transition ${
                disabled
                  ? "cursor-not-allowed bg-slate-300 text-[#64748B]"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              Proceed
            </button>
          </div>
          {qty <= 0 && seatsLeft > 0 ? (
            <p className="text-[10px] font-medium text-amber-600">Please select number of seats</p>
          ) : null}
        </div>

      </div>
    </div>
  );
}
