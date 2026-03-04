"use client";

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
    <div className="space-y-2">
      {displayList.length === 0 ? (
        <p className="text-xs text-[#64748B]">Tiada kelas untuk bahasa yang dipilih.</p>
      ) : (
        displayList.map((c) => {
          const isFirstRecommended =
            recommended.length > 0 && recommended[0]?.id === c.id;
          return (
            <ClassCard
              key={c.id}
              item={c}
              isNextAvailable={isFirstRecommended}
            />
          );
        })
      )}
    </div>
  );
}
