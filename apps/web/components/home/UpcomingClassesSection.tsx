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
const DISPLAY_LIMIT = 6;
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
    return base.slice(0, DISPLAY_LIMIT);
  }, [apiClasses, useDemo]);

  const firstRecommendedId = useMemo(() => {
    if (useDemo) {
      return getRecommendedClasses(DEMO_CLASSES, "" as LanguageFilter, 1)[0]?.id;
    }
    return displayList[0]?.id;
  }, [displayList, useDemo]);

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
                <div className="grid gap-5 lg:grid-cols-3">
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
  isNext,
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

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0F172A]">
            {dayNumber}
            {month ? <span className="font-normal text-[#64748B]"> {month}</span> : null}
            {year ? <span className="font-normal text-[#64748B]">, {year}</span> : null}
          </p>
          <p className="mt-1 text-xs font-medium text-[#64748B]">
            {item.day} • {item.time.replace(/\s*–\s*/g, " – ")}
          </p>
        </div>

        {isNext ? (
          <span className="inline-flex items-center rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
            Next Available
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#334155]">
          Mod: {modeLabel(item.mode)}
        </span>
        <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#334155]">
          Bahasa: {languageLabel(item.language)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#0F172A]">Seats left</p>
          <p className="mt-1 text-sm font-bold text-[#0F172A]">
            {seatsLeft}
          </p>
        </div>

        <QuantitySelector
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
        className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${
          disabled ? "bg-slate-300 cursor-not-allowed" : "bg-[#2563EB] hover:bg-[#1D4ED8]"
        }`}
      >
        Daftar
      </button>
    </div>
  );
}
