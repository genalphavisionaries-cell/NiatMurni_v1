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

function languageLabel(lang: string) {
  if (lang === "B. Melayu") return "Bahasa Melayu";
  if (lang === "Chinese") return "Mandarin";
  if (lang === "English") return "English";
  return lang;
}

function modeLabel(mode: string) {
  if (mode === "Physical") return "Bersemuka";
  return mode;
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
    mode: c.mode === "online" ? "Online" : "Physical",
    language: c.language ?? "B. Melayu",
  };
}

const DEMO_CLASSES = MOCK_HERO_CLASSES;
// Desktop requirement: 3 columns x 10 rows = 30 total maximum shown.
const MAX_CLASSES = 30;
const MOBILE_INITIAL_LIMIT = 2;

export default function UpcomingClassesSection() {
  const [apiClasses, setApiClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileExpanded, setMobileExpanded] = useState(false);

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

  const desktopColumns = useMemo(() => {
    return [
      displayList.slice(0, 10),
      displayList.slice(10, 20),
      displayList.slice(20, 30),
    ];
  }, [displayList]);

  const mobileVisible = mobileExpanded
    ? displayList
    : displayList.slice(0, MOBILE_INITIAL_LIMIT);

  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

  return (
    <section id="classes" className="scroll-mt-20 bg-gradient-to-b from-[#F8FAFC] to-white py-16 sm:py-20">
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
                  {/* Mobile: limited list + load more */}
                  <div className="space-y-2 md:hidden">
                    {mobileVisible.map((c) => (
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

                  {/* Desktop: show more rows */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-3 gap-4">
                      {desktopColumns.map((col, colIdx) => (
                        <div key={colIdx} className="space-y-2">
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

              {/* Mobile load more */}
              {!loading && displayList.length > MOBILE_INITIAL_LIMIT ? (
                <div className="mt-6 flex justify-center md:hidden">
                  {mobileExpanded ? null : (
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(true)}
                      className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC]"
                    >
                      Load More
                    </button>
                  )}
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

  const dayTimeLine = `${item.day} • ${timeText}`.replace(/\s+/g, " ").trim();

  const isOnline = item.mode === "Online";
  const modePill = isOnline ? "Online" : "Bersemuka";
  const languagePill = languageLabel(item.language);
  const showNearFull = seatsLeft > 0 && seatsLeft <= 14;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:shadow-[0_2px_10px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT ZONE: Date + Day/Time */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-none text-[#0F172A]">
            {dateLine}
          </p>
          <p className="mt-0.5 truncate text-[12px] font-semibold leading-tight text-[#64748B]">
            {dayTimeLine}
          </p>
        </div>

        {/* MIDDLE ZONE: Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-[#DBEAFE] px-2 py-1 text-[11px] font-semibold leading-none text-[#1D4ED8] whitespace-nowrap inline-flex items-center gap-1">
            {isOnline ? (
              <span
                className="inline-flex h-[6px] w-[6px] rounded-full bg-[#2563EB]"
                aria-hidden
              />
            ) : null}
            {modePill}
          </span>
          <span className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[11px] font-semibold leading-none text-[#334155] whitespace-nowrap">
            {languagePill}
          </span>
        </div>

        {/* RIGHT ZONE: Seat + Action */}
        <div className="flex shrink-0 flex-col items-end">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Kekosongan
            </span>
            <span
              className={`text-[20px] font-extrabold ${
                showNearFull ? "text-[#DC2626]" : "text-[#0F172A]"
              }`}
            >
              {seatsLeft}
            </span>
            {showNearFull ? (
              <span className="mt-0.5 rounded-full bg-[#FEF3C7] px-2 py-[4px] text-[11px] font-extrabold text-[#92400E] whitespace-nowrap">
                Hampir Penuh
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div className="origin-right scale-[0.92]">
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
              className={`rounded-lg px-3 py-[7px] text-[12px] font-extrabold leading-none shadow-sm transition whitespace-nowrap ${
                disabled
                  ? "bg-slate-300 cursor-not-allowed text-[#0F172A]"
                  : "bg-[#0F3B7B] hover:bg-[#0b2e5f] text-white"
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
