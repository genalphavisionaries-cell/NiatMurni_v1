export const metadata = {
  title: "Footer | CMS | Admin | Niat Murni",
};

export default function AdminCmsFooterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Footer</h1>
        <p className="mt-1 text-sm text-gray-500">Footer content (Laravel CMS API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Footer settings via Laravel CMS.</p>
      </div>
    </div>
  );
}
