"use client";

export function CmsFieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
