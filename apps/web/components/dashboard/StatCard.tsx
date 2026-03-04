import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  className?: string;
};

export function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
