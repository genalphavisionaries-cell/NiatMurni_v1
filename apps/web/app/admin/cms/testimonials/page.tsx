export const metadata = {
  title: "Testimonials | CMS | Admin | Niat Murni",
};

export default function AdminCmsTestimonialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
        <p className="mt-1 text-sm text-gray-500">Manage testimonials (Laravel CMS API)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Testimonial list: GET/POST /admin/testimonials. Add table and form to edit.</p>
      </div>
    </div>
  );
}
