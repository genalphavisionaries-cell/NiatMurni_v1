const GO_API_URL = process.env.NEXT_PUBLIC_GO_API_URL || "";
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "";

// Architecture: registration & payments belong in Go. Once Go exposes e.g. POST /public/register
// returning { redirect_url }, switch registerForClass to use GO_API_URL instead of LARAVEL_API_URL.

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

export async function fetchUpcomingClasses(): Promise<ClassSession[]> {
  const res = await fetch(`${GO_API_URL}/public/classes/upcoming`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.classes) ? data.classes : [];
}

export async function fetchClass(id: string): Promise<ClassSession | null> {
  const res = await fetch(`${GO_API_URL}/classes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export type RegisterPayload = {
  full_name: string;
  nric_passport: string;
  email?: string;
  phone?: string;
  employer_id?: number;
  class_session_id: number;
};

export async function registerForClass(
  payload: RegisterPayload
): Promise<{ redirect_url: string }> {
  const res = await fetch(`${LARAVEL_API_URL}/api/register`, {
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
  const res = await fetch(`${GO_API_URL}/bookings/${id}`);
  if (!res.ok) return null;
  return res.json();
}
