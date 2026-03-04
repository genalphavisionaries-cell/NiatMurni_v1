"use client";

import { useRef, useEffect } from "react";
import type { LanguageFilter } from "./hero-classes";

type LanguageQuickSelectorProps = {
  selectedLanguage: LanguageFilter;
  onLanguageChange: (lang: LanguageFilter) => void;
  hasRecommendedClasses: boolean;
};

const LANGUAGES: { value: LanguageFilter; label: string }[] = [
  { value: "B. Melayu", label: "Bahasa Melayu" },
  { value: "Chinese", label: "Chinese" },
];

export default function LanguageQuickSelector({
  selectedLanguage,
  onLanguageChange,
  hasRecommendedClasses,
}: LanguageQuickSelectorProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleSelect = (lang: LanguageFilter) => {
    onLanguageChange(lang);
    if (hasRecommendedClasses && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={sectionRef} className="scroll-mt-4">
      <p className="text-[13px] font-semibold text-[#0F172A]">Language</p>
      <div className="mt-2 flex gap-2.5">
        {LANGUAGES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedLanguage === value}
            onClick={() => handleSelect(value)}
            className={`inline-flex rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-[background,transform] duration-200 focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2 active:scale-[0.98] ${
              selectedLanguage === value ? "" : "hover:bg-[#F1F5F9]"
            }`}
            style={
              selectedLanguage === value
                ? {
                    background: "#2563EB",
                    color: "white",
                    borderColor: "#2563EB",
                  }
                : {
                    background: "white",
                    color: "#334155",
                    borderColor: "#E2E8F0",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
