const LARAVEL_API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
  "http://localhost:8000";
const MISSING_BACKEND_PREFIX = "[backend missing]";

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function normalizeClassSession(input: unknown): ClassSession | null {
  const row = asObject(input);
  if (!row) return null;
  const program = asObject(row.program);
  const trainer = asObject(row.trainer);

  const id = Number(row.id);
  const programId = Number(row.program_id);
  const startsAt = typeof row.starts_at === "string" ? row.starts_at : "";
  const endsAt = typeof row.ends_at === "string" ? row.ends_at : "";
  if (!Number.isFinite(id) || !Number.isFinite(programId) || !startsAt || !endsAt) return null;

  return {
    id,
    program_id: programId,
    program_name:
      (typeof row.program_name === "string" && row.program_name) ||
      (typeof program?.name === "string" ? program.name : ""),
    trainer_id: Number.isFinite(Number(row.trainer_id)) ? Number(row.trainer_id) : undefined,
    trainer_name:
      (typeof row.trainer_name === "string" && row.trainer_name) ||
      (typeof trainer?.name === "string" ? trainer.name : ""),
    starts_at: startsAt,
    ends_at: endsAt,
    mode: typeof row.mode === "string" ? row.mode : "",
    language: typeof row.language === "string" ? row.language : "",
    venue: typeof row.venue === "string" ? row.venue : typeof row.location === "string" ? row.location : undefined,
    capacity: Number.isFinite(Number(row.capacity)) ? Number(row.capacity) : 0,
    min_threshold: Number.isFinite(Number(row.min_threshold)) ? Number(row.min_threshold) : 0,
    status: typeof row.status === "string" ? row.status : "",
    zoom_join_url: typeof row.zoom_join_url === "string" ? row.zoom_join_url : undefined,
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

export type ClassSession = {
  id: number;
  program_id: number;
  program_name: string;
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
};

export async function fetchUpcomingClasses(filters?: {
  from_date?: string;
  to_date?: string;
  mode?: string;
  language?: string;
}): Promise<ClassSession[]> {
  const params = new URLSearchParams();
  if (filters?.from_date) params.set("from_date", filters.from_date);
  if (filters?.to_date) params.set("to_date", filters.to_date);
  if (filters?.mode) params.set("mode", filters.mode);
  if (filters?.language) params.set("language", filters.language);
  const q = params.toString();
  try {
    const res = await fetch(`${LARAVEL_API}/api/public/classes/upcoming${q ? `?${q}` : ""}`);
    if (!res.ok) {
      if (res.status === 404) logMissingBackendApi("/api/public/classes/upcoming", res.status);
      return [];
    }
    const data = await res.json();
    return extractClassList(data);
  } catch {
    logMissingBackendApi("/api/public/classes/upcoming");
    return [];
  }
}

export async function fetchClass(id: number): Promise<ClassSession | null> {
  try {
    const res = await fetch(`${LARAVEL_API}/api/public/classes/${id}`);
    if (!res.ok) {
      if (res.status === 404) logMissingBackendApi(`/api/public/classes/${id}`, res.status);
      return null;
    }
    const data = await res.json();
    return normalizeClassSession(data) ?? normalizeClassSession(asObject(data)?.data) ?? null;
  } catch {
    logMissingBackendApi(`/api/public/classes/${id}`);
    return null;
  }
}

export type RegisterPayload = {
  full_name: string;
  nric_passport: string;
  phone?: string;
  email?: string;
  employer_id?: number;
  class_session_id: number;
};

export async function registerForClass(payload: RegisterPayload): Promise<{ redirect_url: string }> {
  const res = await fetch(`${LARAVEL_API}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Registration failed");
  }
  if (!data.redirect_url) {
    throw new Error("No payment URL returned");
  }
  return { redirect_url: data.redirect_url };
}

export type BookingStatus = {
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

export async function fetchBookingStatus(bookingId: number): Promise<BookingStatus | null> {
  try {
    const res = await fetch(`${LARAVEL_API}/api/public/bookings/${bookingId}`);
    if (!res.ok) {
      if (res.status === 404) logMissingBackendApi(`/api/public/bookings/${bookingId}`, res.status);
      return null;
    }
    const data = await res.json();
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
    logMissingBackendApi(`/api/public/bookings/${bookingId}`);
    return null;
  }
}
