/** Shared mock class data for hero booking panel. Filter/sort client-side only. */
export type HeroClassItem = {
  id: string;
  date: string;
  dateSort: string; // ISO-ish for sort
  day: string;
  time: string;
  slots: number;
  mode: string;
  language: string;
};

export const MOCK_HERO_CLASSES: HeroClassItem[] = [
  {
    id: "1",
    date: "15 Mac 2026",
    dateSort: "2026-03-15",
    day: "Ahad",
    time: "12.30pm – 4.00pm",
    slots: 14,
    mode: "Online",
    language: "B. Melayu",
  },
  {
    id: "2",
    date: "16 Mac 2026",
    dateSort: "2026-03-16",
    day: "Isnin",
    time: "7.30pm – 10.30pm",
    slots: 9,
    mode: "Online",
    language: "Chinese",
  },
  {
    id: "3",
    date: "18 Mac 2026",
    dateSort: "2026-03-18",
    day: "Rabu",
    time: "9.00am – 1.00pm",
    slots: 8,
    mode: "Physical",
    language: "English",
  },
  {
    id: "4",
    date: "22 Mac 2026",
    dateSort: "2026-03-22",
    day: "Ahad",
    time: "2.00pm – 6.00pm",
    slots: 20,
    mode: "Online",
    language: "Chinese",
  },
];

export type LanguageFilter = "" | "B. Melayu" | "Chinese" | "English";

export function filterClassesByLanguage(
  classes: HeroClassItem[],
  language: LanguageFilter
): HeroClassItem[] {
  if (!language) return [...classes];
  return classes.filter((c) => c.language === language);
}

export function getRecommendedClasses(
  classes: HeroClassItem[],
  language: LanguageFilter,
  limit = 3
): HeroClassItem[] {
  const filtered = filterClassesByLanguage(classes, language).filter(
    (c) => c.slots > 0
  );
  return filtered
    .sort((a, b) => a.dateSort.localeCompare(b.dateSort))
    .slice(0, limit);
}
