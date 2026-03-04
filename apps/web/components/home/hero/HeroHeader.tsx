"use client";

import Link from "next/link";

type HeroHeaderProps = {
  siteName?: string;
};

export default function HeroHeader({ siteName = "Niat Murni Academy" }: HeroHeaderProps) {
  return (
    <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-8">
      <Link
        href="/"
        className="text-lg font-semibold text-white drop-shadow-md hover:opacity-90"
      >
        {siteName}
      </Link>
      <button
        type="button"
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </header>
  );
}
