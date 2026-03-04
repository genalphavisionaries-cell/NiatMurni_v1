type ClassCardProps = {
  date: string;
  day: string;
  time: string;
  slots: number;
  mode: string;
  language: string;
};

export default function ClassCard({
  date,
  day,
  time,
  slots,
  mode,
  language,
}: ClassCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#0F172A]">
          {date} ({day})
        </p>
        <p className="mt-0.5 text-sm text-[#64748B]">{time}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-medium text-[#2563EB]">
            {mode}
          </span>
          <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-medium text-[#2563EB]">
            {language}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-[#64748B]">{slots} Slots Available</p>
      </div>
    </div>
  );
}
