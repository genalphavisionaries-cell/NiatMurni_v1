/**
 * Admin API client for Laravel backend.
 * Base URL: NEXT_PUBLIC_API_URL (fallback: NEXT_PUBLIC_LARAVEL_API_URL).
 * Uses credentials (cookies) for auth.
 */

function getBaseURL(): string {
  if (typeof window === "undefined") return "";
  const env = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL;
  if (env && (env.startsWith("http://") || env.startsWith("https://"))) return env.replace(/\/$/, "");
  const origin = window.location?.origin;
  if (origin && origin !== "null" && (origin.startsWith("http://") || origin.startsWith("https://")))
    return origin;
  return "http://localhost:8000";
}

export const adminApiBaseURL = getBaseURL();

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  modules?: string[];
};

export type ManagedAdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  modules?: string[];
};

export type LoginResponse = { user: AdminUser };
export type MeResponse = { user?: AdminUser; data?: AdminProfile };

export type AdminProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  recovery_email?: string | null;
  role: string;
  modules?: string[];
  status: "active" | "inactive";
  last_login_at?: string | null;
};

export type AdminSystemSettings = {
  site_name: string;
  logo_url: string;
  theme_color: string;
  support_email: string;
  support_phone: string;
};

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const base = getBaseURL();
  if (!base) throw new Error("Admin API base URL is not configured. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_LARAVEL_API_URL.");
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${res.status}`);
  }
  return data as T;
}

// Paginated list response
export type Paginated<T> = { data: T[]; current_page: number; last_page: number; per_page: number; total: number };

export type Program = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  default_capacity: number;
  min_threshold: number;
  delivery_mode: string | null;
  duration_hours: number | null;
  price: string | null;
  is_active: boolean;
};

export type ClassSession = {
  id: number;
  program_id: number;
  trainer_id: number | null;
  starts_at: string;
  ends_at: string;
  mode: string | null;
  language: string | null;
  venue: string | null;
  location: string | null;
  capacity: number;
  min_threshold: number;
  status: string;
  program?: Program;
  trainer?: AdminUser | null;
};

export type Participant = {
  id: number;
  full_name: string;
  nric_passport: string;
  email: string | null;
  phone: string | null;
  employer_id: number | null;
  employer?: { id: number; name: string } | null;
};

export type Booking = {
  id: number;
  participant_id: number;
  class_session_id: number;
  booking_reference: string | null;
  status: string;
  payment_status: string | null;
  payment_amount: string | null;
  paid_at: string | null;
  participant?: Participant;
  class_session?: ClassSession;
};

export const adminApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout(): Promise<{ message: string }> {
    return request<{ message: string }>("/api/admin/logout", { method: "POST" });
  },

  async me(): Promise<MeResponse> {
    const res = await request<MeResponse>("/api/admin/me");
    if (res.user) return res;
    if (res.data) {
      return {
        user: {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          phone: res.data.phone,
          modules: res.data.modules ?? [],
        },
        data: res.data,
      };
    }
    return res;
  },
  getMyProfile(): Promise<{ data: AdminProfile }> {
    return request("/api/admin/me");
  },
  updateMyProfile(data: {
    name: string;
    email: string;
    phone?: string;
    recovery_email?: string;
  }): Promise<{ data: AdminProfile }> {
    return request("/api/admin/me", { method: "PUT", body: JSON.stringify(data) });
  },
  changeMyPassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ data: { message: string } }> {
    return request("/api/admin/me/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getSettings(): Promise<{ data: AdminSystemSettings }> {
    return request("/api/admin/settings");
  },
  updateSettings(data: FormData | {
    site_name: string;
    logo_url?: string;
    theme_color?: string;
    support_email?: string;
    support_phone?: string;
  }): Promise<{ data: AdminSystemSettings }> {
    return request("/api/admin/settings", {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  // Users (native Next admin user management)
  getUsers(params?: { search?: string; status?: "active" | "inactive"; per_page?: number }): Promise<{
    data: ManagedAdminUser[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  }> {
    const p: Record<string, string> = {};
    if (params?.search) p.search = params.search;
    if (params?.status) p.status = params.status;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request("/api/admin/users", { params: p });
  },
  createUser(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: "super_admin" | "operations_admin" | "finance_admin" | "cms_admin" | "accountant";
    status?: "active" | "inactive";
    modules?: string[];
  }): Promise<{ data: ManagedAdminUser }> {
    return request("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
  },
  updateUser(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      role: "super_admin" | "operations_admin" | "finance_admin" | "cms_admin" | "accountant";
      status: "active" | "inactive";
      modules: string[];
    }>
  ): Promise<{ data: ManagedAdminUser }> {
    return request(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteUser(id: number): Promise<{ data: ManagedAdminUser; message: string }> {
    return request(`/api/admin/users/${id}`, { method: "DELETE" });
  },
  resetUserPassword(
    id: number,
    data: { password: string; password_confirmation: string }
  ): Promise<{ data: ManagedAdminUser; message: string }> {
    return request(`/api/admin/users/${id}/reset-password`, { method: "POST", body: JSON.stringify(data) });
  },

  // CMS
  updateHomepageSettings(payload: Record<string, unknown>): Promise<{ message: string; id: number }> {
    return request<{ message: string; id: number }>("/api/admin/homepage-settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Programs
  getPrograms(params?: { search?: string; per_page?: number }): Promise<Paginated<Program>> {
    const p: Record<string, string> = {};
    if (params?.search) p.search = params.search;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<Program>>("/api/admin/programs", { params: p });
  },
  createProgram(data: Partial<Program>): Promise<Program> {
    return request<Program>("/api/admin/programs", { method: "POST", body: JSON.stringify(data) });
  },
  getProgram(id: number): Promise<Program> {
    return request<Program>(`/api/admin/programs/${id}`);
  },
  updateProgram(id: number, data: Partial<Program>): Promise<Program> {
    return request<Program>(`/api/admin/programs/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteProgram(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/programs/${id}`, { method: "DELETE" });
  },

  // Class sessions
  getClassSessions(params?: { program_id?: number; trainer_id?: number; status?: string; per_page?: number }): Promise<Paginated<ClassSession>> {
    const p: Record<string, string> = {};
    if (params?.program_id != null) p.program_id = String(params.program_id);
    if (params?.trainer_id != null) p.trainer_id = String(params.trainer_id);
    if (params?.status) p.status = params.status;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<ClassSession>>("/api/admin/class-sessions", { params: p });
  },
  createClassSession(data: Partial<ClassSession>): Promise<ClassSession> {
    return request<ClassSession>("/api/admin/class-sessions", { method: "POST", body: JSON.stringify(data) });
  },
  getClassSession(id: number): Promise<ClassSession> {
    return request<ClassSession>(`/api/admin/class-sessions/${id}`);
  },
  updateClassSession(id: number, data: Partial<ClassSession>): Promise<ClassSession> {
    return request<ClassSession>(`/api/admin/class-sessions/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteClassSession(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/class-sessions/${id}`, { method: "DELETE" });
  },

  // Tutors
  getTutors(params?: { search?: string; per_page?: number }): Promise<Paginated<AdminUser>> {
    const p: Record<string, string> = {};
    if (params?.search) p.search = params.search;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<AdminUser>>("/api/admin/tutors", { params: p });
  },
  createTutor(data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }): Promise<AdminUser> {
    return request<AdminUser>("/api/admin/tutors", { method: "POST", body: JSON.stringify(data) });
  },
  getTutor(id: number): Promise<AdminUser> {
    return request<AdminUser>(`/api/admin/tutors/${id}`);
  },
  updateTutor(id: number, data: Partial<AdminUser> & { password?: string; password_confirmation?: string }): Promise<AdminUser> {
    return request<AdminUser>(`/api/admin/tutors/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteTutor(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/tutors/${id}`, { method: "DELETE" });
  },

  // Bookings
  getBookings(params?: { status?: string; payment_status?: string; per_page?: number }): Promise<Paginated<Booking>> {
    const p: Record<string, string> = {};
    if (params?.status) p.status = params.status;
    if (params?.payment_status) p.payment_status = params.payment_status;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<Booking>>("/api/admin/bookings", { params: p });
  },
  getBooking(id: number): Promise<Booking> {
    return request<Booking>(`/api/admin/bookings/${id}`);
  },
  updateBooking(id: number, data: { status?: string; payment_status?: string }): Promise<Booking> {
    return request<Booking>(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  // Participants
  getParticipants(params?: { search?: string; per_page?: number }): Promise<Paginated<Participant>> {
    const p: Record<string, string> = {};
    if (params?.search) p.search = params.search;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<Participant>>("/api/admin/participants", { params: p });
  },
  getParticipant(id: number): Promise<Participant> {
    return request<Participant>(`/api/admin/participants/${id}`);
  },

  // Employers (dropdown)
  getEmployers(params?: { search?: string }): Promise<Paginated<{ id: number; name: string }>> {
    return request<Paginated<{ id: number; name: string }>>("/api/admin/employers", { params: params as Record<string, string> });
  },
};
