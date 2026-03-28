import { getApiBase } from "./config";

export type ClassSession = {
  id: number;
  program_id: number;
  program_name: string;
  price?: number;
  price_per_seat?: number;
  trainer_id?: number;
  trainer_name: string;
  starts_at: string;
  ends_at: string;
  mode: string;
  language: string;
  venue?: string;
  capacity: number;
  min_threshold: number;
  status: string;
  zoom_join_url?: string;
  /** True when API returned recent completed sessions (no upcoming). Registration disabled in UI. */
  recent_past?: boolean;
  /** Seats left (from API); preferred over raw capacity for display. */
  available_slots?: number;
};

const BUILD_FETCH_TIMEOUT_MS = 5000;
const MISSING_BACKEND_PREFIX = "[backend missing]";

/**
 * Build absolute URL for Laravel `routes/api.php` paths (e.g. `/api/public/...`).
 * Canonical env is `getApiBase()` without `/api`; this still handles a trailing `/api` safely.
 */
function laravelApiUrl(pathFromRoot: string): string {
  const base = getApiBase();
  if (!base) return "";
  const p = pathFromRoot.startsWith("/") ? pathFromRoot : `/${pathFromRoot}`;
  if (base.endsWith("/api")) {
    return p.startsWith("/api") ? `${base}${p.slice(4)}` : `${base}${p}`;
  }
  return `${base}${p}`;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const text = await res.text();
  if (process.env.NODE_ENV === "development") {
    console.log("API raw response:", text.length > 800 ? `${text.slice(0, 800)}…` : text);
  }
  const trimmed = (text ?? "").trim();
  const looksLikeJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!looksLikeJson) {
    throw new Error("Invalid API response");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid API response");
  }
}

function normalizeClassSession(input: unknown): ClassSession | null {
  const classData = asObject(input);
  if (!classData) return null;

  const program = asObject(classData.program);
  const trainer = asObject(classData.trainer);

  const id = Number(classData.id);
  const programId = Number(classData.program_id);
  const startsAt = typeof classData.starts_at === "string" ? classData.starts_at : "";
  let endsAt = typeof classData.ends_at === "string" ? classData.ends_at : "";
  if (!endsAt && startsAt) {
    endsAt = startsAt;
  }
  if (!Number.isFinite(id) || !Number.isFinite(programId) || !startsAt || !endsAt) return null;

  const classPrice =
    classData.price ??
    (classData.price_cents ? Number(classData.price_cents) / 100 : 0);

  return {
    id,
    program_id: programId,
    program_name:
      (typeof classData.program_name === "string" && classData.program_name) ||
      (typeof program?.name === "string" ? program.name : ""),
    trainer_id: Number.isFinite(Number(classData.trainer_id)) ? Number(classData.trainer_id) : undefined,
    trainer_name:
      (typeof classData.trainer_name === "string" && classData.trainer_name) ||
      (typeof trainer?.name === "string" ? trainer.name : ""),
    price: Number(classPrice),
    price_per_seat: Number(classPrice),
    starts_at: startsAt,
    ends_at: endsAt,
    mode: typeof classData.mode === "string" ? classData.mode : "",
    language: typeof classData.language === "string" ? classData.language : "",
    venue: typeof classData.venue === "string" ? classData.venue : typeof classData.location === "string" ? classData.location : undefined,
    capacity: Number.isFinite(Number(classData.capacity)) ? Number(classData.capacity) : 0,
    available_slots: Number.isFinite(Number(classData.available_slots))
      ? Number(classData.available_slots)
      : undefined,
    min_threshold: Number.isFinite(Number(classData.min_threshold)) ? Number(classData.min_threshold) : 0,
    status: typeof classData.status === "string" ? classData.status : "",
    zoom_join_url: typeof classData.zoom_join_url === "string" ? classData.zoom_join_url : undefined,
    recent_past: classData.recent_past === true,
  };
}

function extractClassList(data: unknown): ClassSession[] {
  if (Array.isArray(data)) return data.map(normalizeClassSession).filter((c): c is ClassSession => !!c);
  const obj = asObject(data);
  const candidates = Array.isArray(obj?.classes) ? obj.classes : Array.isArray(obj?.data) ? obj.data : [];
  return candidates.map(normalizeClassSession).filter((c): c is ClassSession => !!c);
}

function logMissingBackendApi(endpoint: string, status?: number) {
  console.warn(
    `${MISSING_BACKEND_PREFIX} Laravel API ${endpoint} is unavailable${status ? ` (status ${status})` : ""}`
  );
}

export async function fetchUpcomingClasses(): Promise<ClassSession[]> {
  const canonicalUrl = `${getApiBase()}/api/public/classes/upcoming`;
  console.log("API URL:", canonicalUrl);

  if (!getApiBase()) {
    logMissingBackendApi("/api/public/classes/upcoming");
    return [];
  }

  const fetchUrl = laravelApiUrl("/api/public/classes/upcoming");
  console.log("fetchUpcomingClasses resolved URL:", fetchUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BUILD_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeout);
    console.log("Status:", res.status);

    if (!res.ok) {
      const errBody = await res.text();
      console.log("RAW API DATA:", errBody);
      if (res.status === 404) logMissingBackendApi("/api/public/classes/upcoming", res.status);
      return [];
    }

    const data = await parseJsonResponse(res);
    console.log("RAW API DATA:", data);
    const mappedClasses = extractClassList(data);
    console.log("FINAL CLASSES:", mappedClasses);
    return mappedClasses;
  } catch {
    clearTimeout(timeout);
    logMissingBackendApi("/api/public/classes/upcoming");
    return [];
  }
}

export async function fetchClass(id: string): Promise<ClassSession | null> {
  if (!getApiBase()) {
    logMissingBackendApi(`/api/public/classes/${id}`);
    return null;
  }
  try {
    const res = await fetch(laravelApiUrl(`/api/public/classes/${id}`), {
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      if (res.status === 404) logMissingBackendApi(`/api/public/classes/${id}`, res.status);
      return null;
    }
    const data = await parseJsonResponse(res);
    return normalizeClassSession(data) ?? normalizeClassSession(asObject(data)?.data) ?? null;
  } catch {
    logMissingBackendApi(`/api/public/classes/${id}`);
    return null;
  }
}

export type RegisterPayload = {
  full_name: string;
  nric_passport: string;
  email?: string;
  phone?: string;
  employer_id?: number;
  class_session_id: number;
};

export type CreateReservationPayload = {
  class_session_id: number;
  seat_count: number;
  full_name: string;
  identity_no: string;
  phone: string;
  email?: string;
  company_name?: string;
  delivery_address?: string;
  delivery_type?: "normal" | "fast";
  delivery_fee?: number;
};

export type CreateReservationResponse = {
  reservation_id: number;
  booking_id?: number;
  total_amount: number;
  expires_at: string;
};

export type CheckoutPayload = {
  reservation_id: number;
};

export type PublicCheckoutSettings = {
  delivery: {
    normal: { enabled: boolean; fee: number };
    fast: { enabled: boolean; fee: number };
    rules?: string;
  };
  manual_payment: {
    enabled: boolean;
    methods: string[];
    qr_image_url?: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
    bank_code?: string;
    instructions?: string;
  };
};

export async function registerForClass(
  payload: RegisterPayload
): Promise<{ redirect_url: string }> {
  const res = await fetch(laravelApiUrl("/api/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || "Registration failed");
  }
  if (!data.redirect_url) {
    throw new Error("No payment URL returned");
  }
  return { redirect_url: String(data.redirect_url) };
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<CreateReservationResponse> {
  const res = await fetch(laravelApiUrl("/api/reservations"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || "Failed to create reservation");
  }
  return {
    reservation_id: Number(data.reservation_id),
    booking_id: data.booking_id != null ? Number(data.booking_id) : undefined,
    total_amount: Number(data.total_amount),
    expires_at: String(data.expires_at ?? ""),
  };
}

export async function createPaymentCheckout(
  payload: CheckoutPayload
): Promise<{ checkout_url: string }> {
  const res = await fetch(laravelApiUrl("/api/payments/checkout"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(res) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || "Failed to create checkout session");
  }
  if (!data.checkout_url) {
    throw new Error("Checkout URL was not returned.");
  }
  return { checkout_url: String(data.checkout_url) };
}

export async function submitManualPaymentForBooking(
  bookingId: number,
  receipt: File
): Promise<{ message: string; payment_status: string; receipt_url?: string }> {
  const form = new FormData();
  form.set("receipt", receipt);
  form.set("payment_method", "manual");

  const res = await fetch(laravelApiUrl(`/api/bookings/${bookingId}/manual-payment`), {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });
  const data = (await parseJsonResponse(res)) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || "Failed to submit manual payment");
  }

  return {
    message: String(data.message ?? "Manual payment submitted successfully"),
    payment_status: String(data.payment_status ?? "pending_verification"),
    receipt_url: typeof data.receipt_url === "string" ? data.receipt_url : undefined,
  };
}

export async function fetchPublicCheckoutSettings(): Promise<PublicCheckoutSettings | null> {
  try {
    const res = await fetch(laravelApiUrl("/api/public/settings"), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await parseJsonResponse(res)) as Record<string, unknown>;
    const root = asObject(data.data) ?? asObject(data);
    const checkout = asObject(root?.checkout);
    if (!checkout) return null;

    const delivery = asObject(checkout.delivery) ?? {};
    const normal = asObject(delivery.normal) ?? {};
    const fast = asObject(delivery.fast) ?? {};
    const manual = asObject(checkout.manual_payment) ?? {};

    return {
      delivery: {
        normal: {
          enabled: Boolean(normal.enabled ?? true),
          fee: Number(normal.fee ?? 10),
        },
        fast: {
          enabled: Boolean(fast.enabled ?? true),
          fee: Number(fast.fee ?? 20),
        },
        rules: typeof delivery.rules === "string" ? delivery.rules : "",
      },
      manual_payment: {
        enabled: Boolean(manual.enabled ?? true),
        methods: Array.isArray(manual.methods) ? manual.methods.map((m) => String(m)) : ["bank_transfer", "qr", "cash"],
        qr_image_url: typeof manual.qr_image_url === "string" ? manual.qr_image_url : "",
        account_name: typeof manual.account_name === "string" ? manual.account_name : "",
        bank_name: typeof manual.bank_name === "string" ? manual.bank_name : "",
        account_number: typeof manual.account_number === "string" ? manual.account_number : "",
        bank_code: typeof manual.bank_code === "string" ? manual.bank_code : "",
        instructions: typeof manual.instructions === "string" ? manual.instructions : "",
      },
    };
  } catch {
    return null;
  }
}

export type BookingResponse = {
  status: string;
  booking: {
    id: number;
    participant_id: number;
    class_session_id: number;
    status: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
  };
};

export async function fetchBooking(id: string): Promise<BookingResponse | null> {
  if (!getApiBase()) {
    logMissingBackendApi(`/api/public/bookings/${id}`);
    return null;
  }
  try {
  const res = await fetch(laravelApiUrl(`/api/public/bookings/${id}`), {
    headers: {
      "Accept": "application/json",
    },
  });
    if (!res.ok) {
      if (res.status === 404) logMissingBackendApi(`/api/public/bookings/${id}`, res.status);
      return null;
    }
    const data = await parseJsonResponse(res);
    const payload = asObject(data);
    const bookingObj = asObject(payload?.booking) ?? payload;
    if (!bookingObj) return null;

    const booking = {
      id: Number(bookingObj.id),
      participant_id: Number(bookingObj.participant_id),
      class_session_id: Number(bookingObj.class_session_id),
      status: typeof bookingObj.status === "string" ? bookingObj.status : "unknown",
      paid_at: typeof bookingObj.paid_at === "string" ? bookingObj.paid_at : undefined,
      created_at: typeof bookingObj.created_at === "string" ? bookingObj.created_at : "",
      updated_at: typeof bookingObj.updated_at === "string" ? bookingObj.updated_at : "",
    };
    if (!Number.isFinite(booking.id) || !Number.isFinite(booking.class_session_id)) return null;

    return {
      status:
        (typeof payload?.status === "string" && payload.status) ||
        booking.status,
      booking,
    };
  } catch {
    logMissingBackendApi(`/api/public/bookings/${id}`);
    return null;
  }
}
