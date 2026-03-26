"use client";

export type BookingFormValues = {
  full_name: string;
  phone: string;
  identity_no: string;
  email: string;
  company_name: string;
  delivery_type: "normal" | "fast";
  delivery_address: string;
};

type Props = {
  values: BookingFormValues;
  onChange: (next: BookingFormValues) => void;
  disabled?: boolean;
};

export function BookingForm({ values, onChange, disabled }: Props) {
  const set = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-900">Participant Details</h3>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm text-slate-700">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => console.log("cart.returning_user.login")}
            className="font-medium text-amber-700 hover:underline"
            disabled={disabled}
          >
            Login
          </button>{" "}
          <span className="text-slate-400">|</span>{" "}
          <button
            type="button"
            onClick={() => console.log("cart.returning_user.register")}
            className="font-medium text-amber-700 hover:underline"
            disabled={disabled}
          >
            Register
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Full Name *</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="e.g. Aina Binti Ali"
            value={values.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone *</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="+60 12-345 6789"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Identity No *</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="NRIC / Passport"
            value={values.identity_no}
            onChange={(e) => set("identity_no", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="name@email.com"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Company Name</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Optional company name"
            value={values.company_name}
            onChange={(e) => set("company_name", e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 p-3">
        <p className="text-sm font-medium text-slate-900">Delivery</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-300 p-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="delivery_type"
                checked={values.delivery_type === "normal"}
                onChange={() => set("delivery_type", "normal")}
                disabled={disabled}
              />
              <span>Normal Delivery</span>
            </span>
            <span className="font-medium text-slate-700">RM 10</span>
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-300 p-3 text-sm">
            <span className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="delivery_type"
                checked={values.delivery_type === "fast"}
                onChange={() => set("delivery_type", "fast")}
                disabled={disabled}
              />
              <span>Fast Delivery</span>
            </span>
            <span className="font-medium text-slate-700">RM 20</span>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Delivery Address</span>
          <textarea
            className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Optional delivery address"
            value={values.delivery_address}
            onChange={(e) => set("delivery_address", e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
