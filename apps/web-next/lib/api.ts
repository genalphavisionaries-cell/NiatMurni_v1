const GO_API = process.env.NEXT_PUBLIC_GO_API_URL || "http://localhost:8080";
const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000";

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
  const res = await fetch(`${GO_API}/public/classes/upcoming${q ? `?${q}` : ""}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.classes ?? [];
}

export async function fetchClass(id: number): Promise<ClassSession | null> {
  const res = await fetch(`${GO_API}/classes/${id}`);
  if (!res.ok) return null;
  return res.json();
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
  const res = await fetch(`${GO_API}/bookings/${bookingId}`);
  if (!res.ok) return null;
  return res.json();
}
