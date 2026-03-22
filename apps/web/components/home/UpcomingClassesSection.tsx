"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchUpcomingClasses, type ClassSession } from "@/lib/api";
import {
  MOCK_HERO_CLASSES,
  getRecommendedClasses,
  type HeroClassItem,
  type LanguageFilter,
} from "@/components/home/hero/hero-classes";
import QuantitySelector from "@/components/home/hero/QuantitySelector";

type CartItem = {
  classId: string;
  qty: number;
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
  };
}

// TEMP: UI stress testing with mock classes — replace DEMO_CLASSES with 24 varied items
// when live API returns no data. Real API data is still used when available.
const _DAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"] as const;
const _LANGS = ["Bahasa Melayu", "Chinese", "English", "Tamil"] as const;
const _MODES = ["online", "physical"] as const; // raw canonical values — modeLabel() resolves to display
const _TIMES = [
  "12.30pm – 4.00pm",
  "7.30pm – 10.30pm",
  "9.00am – 1.00pm",
  "2.00pm – 6.00pm",
  "10.00am – 1.00pm",
  "8.00pm – 10.00pm",
] as const;
const _SEATS = [5, 8, 12, 14, 20, 25, 30, 10, 7, 3] as const;
const _MONTHS = [
  "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos",
] as const;

const STRESS_DEMO_CLASSES: HeroClassItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: String(100 + i),
  date: `${10 + (i % 20)} ${_MONTHS[i % _MONTHS.length]} 2026`,
  dateSort: `2026-0${3 + Math.floor(i / 8)}-${String(10 + (i % 20)).padStart(2, "0")}`,
  day: _DAYS[i % _DAYS.length],
  time: _TIMES[i % _TIMES.length],
  slots: _SEATS[i % _SEATS.length],
  mode: _MODES[i % _MODES.length],
  language: _LANGS[i % _LANGS.length],
}));

const DEMO_CLASSES = STRESS_DEMO_CLASSES.length > 0 ? STRESS_DEMO_CLASSES : MOCK_HERO_CLASSES;
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

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const displayList: HeroClassItem[] = useMemo(() => {
    const base = useDemo ? DEMO_CLASSES : apiClasses.map(toHeroItem);
    return base.slice(0, MAX_CLASSES);
  }, [apiClasses, useDemo]);

  const firstRecommendedId = useMemo(() => {
    if (useDemo) {
      return getRecommendedClasses(DEMO_CLASSES, "" as LanguageFilter, 1)[0]?.id;
    }
    return displayList[0]?.id;
  }, [displayList, useDemo]);

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

  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

  return (
    <section id="classes" className="scroll-mt-20 bg-[#EFF6FF] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              {displayList.length ? (
                <>
                  {/* Mobile list */}
                  <div className="space-y-1.5 md:hidden">
                    {mobileList.map((c) => (
                      <UpcomingClassCard
                        key={c.id}
                        item={c}
                        isNext={firstRecommendedId === c.id}
                        onAddToCart={(qty) => {
                          setCart((prev) => {
                            const existing = prev.find((p) => p.classId === c.id);
                            if (existing) {
                              return prev.map((p) =>
                                p.classId === c.id ? { ...p, qty: p.qty + qty } : p
                              );
                            }
                            return [...prev, { classId: c.id, qty }];
                          });
                          setCartOpen(true);
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
                                setCart((prev) => {
                                  const existing = prev.find(
                                    (p) => p.classId === c.id
                                  );
                                  if (existing) {
                                    return prev.map((p) =>
                                      p.classId === c.id
                                        ? { ...p, qty: p.qty + qty }
                                        : p
                                    );
                                  }
                                  return [...prev, { classId: c.id, qty }];
                                });
                                setCartOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

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
                  * Daftar akan dibawa ke halaman booking.
                </div>
              </div>

              {useDemo ? (
                <p className="mt-6 text-center text-sm text-[#64748B]">
                  Demo content. Data live belum tersedia buat masa ini.
                </p>
              ) : null}
            </>
          )}
        </div>

        {/* Cart popup */}
        {cartOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Keranjang Pendaftaran</h3>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {cartCount} seat dipilih. Pilih kelas untuk teruskan booking.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close cart"
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                  onClick={() => setCartOpen(false)}
                >
                  Tutup
                </button>
              </div>

              <div className="p-6">
                {cart.length ? (
                  <ul className="space-y-3">
                    {cart.map((it) => (
                      <li
                        key={it.classId}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A]">
                            Kelas sesi #{it.classId}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1">
                            Kuantiti: {it.qty}
                          </p>
                        </div>
                        <Link
                          href={`/booking/${it.classId}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                          onClick={() => setCartOpen(false)}
                        >
                          Terus Booking →
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#64748B]">Keranjang anda kosong.</p>
                )}

                <p className="mt-4 text-xs text-[#64748B]">
                  Nota: Buat masa ini, “cart popup” adalah pilihan sementara untuk memudahkan pendaftaran.
                </p>
              </div>
            </div>
          </div>
        ) : null}
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
  const [qty, setQty] = useState(1);
  const seatsLeft = item.slots ?? 0;
  const max = Math.max(1, Math.min(10, seatsLeft));
  const disabled = seatsLeft <= 0;
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

  const seatColor =
    seatsLeft <= 10
      ? "text-red-500"
      : seatsLeft <= 20
      ? "text-orange-500"
      : "text-gray-800";

  return (
    <div className="rounded-xl border border-[#D1D5DB] bg-white px-2.5 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.07)] transition hover:shadow-[0_3px_12px_rgba(15,23,42,0.10)]">
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
                min={1}
                max={max}
                defaultValue={1}
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
              className={`inline-flex h-[26px] min-w-[3.75rem] shrink-0 items-center justify-center rounded-md px-2 text-[11px] font-bold leading-none shadow-sm transition ${
                disabled
                  ? "cursor-not-allowed bg-slate-300 text-[#0F172A]"
                  : "bg-[#0F3B7B] text-white hover:bg-[#0b2e5f]"
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
