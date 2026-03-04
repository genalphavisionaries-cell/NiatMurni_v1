import Link from "next/link";

export const metadata = {
  title: "CMS | Admin | Niat Murni",
};

export default function AdminCmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CMS</h1>
        <p className="mt-1 text-sm text-gray-500">Content management (Laravel CMS API)</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cms/homepage"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">Homepage</h2>
          <p className="mt-1 text-sm text-gray-500">Edit homepage settings</p>
        </Link>
        <Link
          href="/admin/cms/testimonials"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">Testimonials</h2>
          <p className="mt-1 text-sm text-gray-500">Manage testimonials</p>
        </Link>
        <Link
          href="/admin/cms/logos"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">Logos</h2>
          <p className="mt-1 text-sm text-gray-500">Brand logos</p>
        </Link>
        <Link
          href="/admin/cms/footer"
          className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="font-semibold text-gray-900">Footer</h2>
          <p className="mt-1 text-sm text-gray-500">Footer content</p>
        </Link>
      </div>
    </div>
  );
}
