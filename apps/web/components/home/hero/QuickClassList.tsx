import ClassCard from "./ClassCard";

const MOCK_CLASSES = [
  {
    date: "15 Mac 2026",
    day: "Ahad",
    time: "12.30pm – 4.00pm",
    slots: 14,
    mode: "Online",
    language: "B. Melayu",
  },
  {
    date: "18 Mac 2026",
    day: "Rabu",
    time: "9.00am – 1.00pm",
    slots: 8,
    mode: "Physical",
    language: "English",
  },
  {
    date: "22 Mac 2026",
    day: "Ahad",
    time: "2.00pm – 6.00pm",
    slots: 20,
    mode: "Online",
    language: "Chinese",
  },
];

export default function QuickClassList() {
  return (
    <div className="space-y-3">
      {MOCK_CLASSES.map((c, i) => (
        <ClassCard
          key={i}
          date={c.date}
          day={c.day}
          time={c.time}
          slots={c.slots}
          mode={c.mode}
          language={c.language}
        />
      ))}
    </div>
  );
}
