"use client";

import Link from "next/link";
import ClassCard from "./ClassCard";
import {
  MOCK_HERO_CLASSES,
  filterClassesByLanguage,
  getRecommendedClasses,
  type LanguageFilter,
} from "./hero-classes";

const DISPLAY_LIMIT = 5;

type QuickClassListProps = {
  selectedLanguage: LanguageFilter;
};

export default function QuickClassList({ selectedLanguage }: QuickClassListProps) {
  const filtered = filterClassesByLanguage(MOCK_HERO_CLASSES, selectedLanguage);
  const recommended = getRecommendedClasses(MOCK_HERO_CLASSES, selectedLanguage, DISPLAY_LIMIT);
  const displayList = filtered.slice(0, DISPLAY_LIMIT);

  return (
    <div className="space-y-[10px]">
      {displayList.length === 0 ? (
        <p className="text-sm text-[#64748B]">Tiada kelas untuk bahasa yang dipilih.</p>
      ) : (
        <>
          {displayList.map((c) => {
            const isFirstRecommended =
              recommended.length > 0 && recommended[0]?.id === c.id;
            return (
              <ClassCard
                key={c.id}
                item={c}
                isNextAvailable={isFirstRecommended}
              />
            );
          })}
          <Link
            href="/#classes"
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          >
            Lihat jadual kelas →
          </Link>
        </>
      )}
    </div>
  );
}
