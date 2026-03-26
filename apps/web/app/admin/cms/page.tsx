import Link from "next/link";

export const metadata = {
  title: "CMS | Admin | Niat Murni",
};

const pages = [
  { href: "/admin/cms/homepage", title: "Homepage", desc: "Edit hero, USP, classes, and promo sections" },
  { href: "/admin/cms/header", title: "Header & Navigation", desc: "Logo, menu items, CTA button, languages" },
  { href: "/admin/cms/footer", title: "Footer", desc: "Branding, links, payment trust, copyright" },
  { href: "/admin/cms/testimonials", title: "Testimonials", desc: "Customer reviews shown on the homepage" },
  { href: "/admin/cms/logos", title: "Logos & Trust", desc: "Partner logos and Google rating" },
];

export default function AdminCmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CMS</h1>
        <p className="mt-1 text-sm text-gray-500">Manage public website content.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-semibold text-gray-900">{p.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
