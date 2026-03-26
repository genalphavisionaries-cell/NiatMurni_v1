"use client";

type Props = {
  status: "pending" | "paid" | "completed";
};

export function StatusBadge({ status }: Props) {
  const ui =
    status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "paid"
      ? "bg-blue-50 text-blue-700"
      : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ui}`}>{status}</span>;
}

