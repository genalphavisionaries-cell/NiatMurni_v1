"use client";

export type BookingFormValues = {
  full_name: string;
  phone: string;
  phone_country_code: string;
  identity_no: string;
  nationality: "malaysian" | "non_malaysian";
  email: string;
  company_name: string;
  referral_code: string;
  promo_code: string;
  delivery_type: "normal" | "fast";
  address_line_1: string;
  address_line_2: string;
  postcode: string;
  city: string;
  state: string;
};

type Props = {
  values: BookingFormValues;
  onChange: (next: BookingFormValues) => void;
  disabled?: boolean;
};

export function BookingForm({ values, onChange, disabled }: Props) {
  const set = <K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const STATES = [
    "Selangor",
    "Kuala Lumpur",
    "Johor",
    "Penang",
    "Perak",
    "Kedah",
    "Kelantan",
    "Terengganu",
    "Pahang",
    "Melaka",
    "Negeri Sembilan",
    "Sabah",
    "Sarawak",
    "Perlis",
    "Putrajaya",
    "Labuan",
  ];
  const PHONE_CODES = [
    { label: "MY +60", value: "+60" },
    { label: "SG +65", value: "+65" },
    { label: "ID +62", value: "+62" },
    { label: "TH +66", value: "+66" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Participant Details</h3>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
            <select
              className="rounded-lg border border-slate-300 px-2 py-2"
              value={values.phone_country_code}
              onChange={(e) => set("phone_country_code", e.target.value)}
              disabled={disabled}
            >
              {PHONE_CODES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="123456789"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
              disabled={disabled}
            />
          </div>
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
          <span className="mb-1 block font-medium text-slate-700">Nationality</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={values.nationality}
            onChange={(e) => set("nationality", e.target.value as "malaysian" | "non_malaysian")}
            disabled={disabled}
          >
            <option value="malaysian">Malaysian</option>
            <option value="non_malaysian">Non-Malaysian</option>
          </select>
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
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Referral Code</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Optional referral code"
            value={values.referral_code}
            onChange={(e) => set("referral_code", e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Promo Code</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Optional promo code"
            value={values.promo_code}
            onChange={(e) => set("promo_code", e.target.value)}
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

      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Address Line 1 *</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="House / building / street"
              value={values.address_line_1}
              onChange={(e) => set("address_line_1", e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Address Line 2</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Unit / floor / landmark (optional)"
              value={values.address_line_2}
              onChange={(e) => set("address_line_2", e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Postcode *</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="5-digit postcode"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              value={values.postcode}
              onChange={(e) => set("postcode", e.target.value.replace(/\D/g, "").slice(0, 5))}
              disabled={disabled}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">City *</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="City"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">State *</span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={values.state}
              onChange={(e) => set("state", e.target.value)}
              disabled={disabled}
            >
              <option value="">Select state</option>
              {STATES.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
