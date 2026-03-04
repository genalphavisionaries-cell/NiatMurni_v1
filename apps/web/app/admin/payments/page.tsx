export const metadata = {
  title: "Payments | Admin | Niat Murni",
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">Payment history (data from Go API / Stripe)</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Payment list will be loaded from Go API.</p>
      </div>
    </div>
  );
}
