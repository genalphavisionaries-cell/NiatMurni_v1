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
  module_access?: string[];
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
  module_access?: string[];
  status: "active" | "inactive";
  last_login_at?: string | null;
};

// CMS types (relational model)
export type CmsHeroData = { headline: string; subheadline: string; buttons: { label: string; url: string; color?: string }[]; background_urls: string };
export type CmsUspPoint = { icon: string; title: string; description: string };
export type CmsUspData = { title: string; description: string; points: CmsUspPoint[]; side_images_urls: string };
export type CmsClassesData = { title: string; description: string; button_text: string; button_url: string; max_items: number };
export type CmsTrustLogo = { image_url: string; title: string };
export type CmsTrustData = { logos: CmsTrustLogo[]; google_rating_text: string; google_button_label: string; google_button_url: string };
export type CmsPromoCard = { image_url: string; title: string; description: string; button_label: string; url: string };
export type CmsPromoData = { title: string; description: string; banner_urls: string; cards: CmsPromoCard[] };
export type CmsMenuItem = { label: string; url: string; type: string; has_children: boolean };
export type CmsHeaderData = { logo_url: string; menu_items: CmsMenuItem[]; cta: { label: string; url: string; bg_color: string; text_color: string }; languages: { code: string; label: string; active: boolean }[] };
export type CmsFooterLink = { label: string; url: string };
export type CmsFooterData = { brand: { logo_url: string; description: string }; quick_links: CmsFooterLink[]; buttons: CmsFooterLink[]; payment: { title: string; icons_urls: string }; legal_links: CmsFooterLink[]; bottom: { copyright: string; ssl_badge_url: string } };
export type CmsFloatingItem = { icon: string; label: string; url: string };
export type CmsFloatingData = { enabled: boolean; style_json: string; items: CmsFloatingItem[] };
export type CmsHomepageData = { hero: CmsHeroData; usp: CmsUspData; classes: CmsClassesData; trust: CmsTrustData; promo: CmsPromoData; header: CmsHeaderData; footer: CmsFooterData; floating_menu: CmsFloatingData };
export type CmsTestimonial = { id: number; name: string; image_url: string | null; rating: number; content: string; is_active: boolean; sort_order: number; created_at?: string; updated_at?: string };

export type AdminSystemSettings = {
  site_name: string;
  logo_url: string;
  theme_color: string;
  support_email: string;
  support_phone: string;
};

export type AdminApiConnections = {
  google_analytics: {
    measurement_id: string;
    service_account: string;
  };
  stripe: {
    publishable_key: string;
    secret_key: string;
    webhook_secret: string;
  };
};

export type DashboardOverview = {
  revenue: {
    today: number | null;
    this_month: number | null;
    this_year: number | null;
  };
  bookings: {
    today: number | null;
    this_week: number | null;
    this_month: number | null;
    total: number | null;
  };
  participants: {
    total: number | null;
  };
  tutors: {
    active: number | null;
    total: number | null;
  };
  classes: {
    upcoming: number | null;
    ongoing: number | null;
  };
  certificates: {
    issued: number | null;
  };
};

export type FinanceTimelinePoint = {
  period: string;
  amount_cents: number;
};

export type VoucherType = "fixed" | "percentage" | "free_delivery";
export type VoucherStatus = "active" | "inactive";

export type Voucher = {
  id: number;
  code: string;
  type: VoucherType;
  value: string | null;
  min_seats: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  applicable_class_session_id: number | null;
  status: VoucherStatus;
  created_at: string;
  updated_at: string;
  applicable_class_session?: ClassSession | null;
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
  created_at?: string;
  updated_at?: string;
  seat_count?: number;
  active_payment?: {
    id: number;
    provider: "stripe" | "manual" | string;
    method?: string | null;
    status: string;
    amount_cents?: number | null;
    receipt_url?: string | null;
    paid_at?: string | null;
  } | null;
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
          module_access: res.data.module_access ?? res.data.modules ?? [],
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
  getApiConnections(): Promise<{ data: AdminApiConnections }> {
    return request("/api/admin/settings/api-connections");
  },
  updateApiConnections(data: AdminApiConnections): Promise<{ data: AdminApiConnections }> {
    return request("/api/admin/settings/api-connections", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  getDashboardOverview(): Promise<{ data: DashboardOverview }> {
    return request("/api/admin/dashboard/overview");
  },
  getRevenueTimeline(period: "day" | "week" | "month" | "year" = "month"): Promise<{ period: string; data: FinanceTimelinePoint[] }> {
    return request("/api/admin/finance/revenue-timeline", { params: { period } });
  },
  getRefundTimeline(period: "day" | "week" | "month" | "year" = "month"): Promise<{ period: string; data: FinanceTimelinePoint[] }> {
    return request("/api/admin/finance/refund-timeline", { params: { period } });
  },
  getTutorPayoutTimeline(period: "day" | "week" | "month" | "year" = "month"): Promise<{ period: string; data: FinanceTimelinePoint[] }> {
    return request("/api/admin/finance/tutor-payout-timeline", { params: { period } });
  },

  // Vouchers
  getVouchers(params?: { status?: VoucherStatus; search?: string; per_page?: number }): Promise<Paginated<Voucher>> {
    const p: Record<string, string> = {};
    if (params?.status) p.status = params.status;
    if (params?.search) p.search = params.search;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<Voucher>>("/api/admin/vouchers", { params: p });
  },
  createVoucher(data: {
    code: string;
    type: VoucherType;
    value?: number | null;
    min_seats?: number | null;
    max_uses?: number | null;
    valid_from?: string | null;
    valid_until?: string | null;
    applicable_class_session_id?: number | null;
    status?: VoucherStatus;
  }): Promise<{ data: Voucher }> {
    return request("/api/admin/vouchers", { method: "POST", body: JSON.stringify(data) });
  },
  updateVoucher(id: number, data: {
    code: string;
    type: VoucherType;
    value?: number | null;
    min_seats?: number | null;
    max_uses?: number | null;
    valid_from?: string | null;
    valid_until?: string | null;
    applicable_class_session_id?: number | null;
    status?: VoucherStatus;
  }): Promise<{ data: Voucher }> {
    return request(`/api/admin/vouchers/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteVoucher(id: number): Promise<{ message: string }> {
    return request(`/api/admin/vouchers/${id}`, { method: "DELETE" });
  },
  toggleVoucher(id: number): Promise<{ data: Voucher }> {
    return request(`/api/admin/vouchers/${id}/toggle`, { method: "POST" });
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

  // CMS — new relational model (cms_pages / cms_sections / cms_items)
  getCmsHomepage(): Promise<{ data: CmsHomepageData }> {
    return request("/api/admin/cms/homepage");
  },
  updateCmsHomepage(payload: Partial<CmsHomepageData>): Promise<{ message: string }> {
    return request("/api/admin/cms/homepage", { method: "PUT", body: JSON.stringify(payload) });
  },
  getCmsTestimonials(): Promise<{ data: CmsTestimonial[] }> {
    return request("/api/admin/cms/testimonials");
  },
  createCmsTestimonial(data: Omit<CmsTestimonial, "id" | "created_at" | "updated_at">): Promise<{ data: CmsTestimonial; message: string }> {
    return request("/api/admin/cms/testimonials", { method: "POST", body: JSON.stringify(data) });
  },
  updateCmsTestimonial(id: number, data: Partial<CmsTestimonial>): Promise<{ data: CmsTestimonial; message: string }> {
    return request(`/api/admin/cms/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteCmsTestimonial(id: number): Promise<{ message: string }> {
    return request(`/api/admin/cms/testimonials/${id}`, { method: "DELETE" });
  },

  // Legacy CMS (old HomepageSetting singleton — kept for backward compat)
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
  getBookings(params?: {
    status?: string;
    payment_status?: string;
    payment_method?: string; // stripe/manual
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
    search?: string;
    per_page?: number;
  }): Promise<Paginated<Booking>> {
    const p: Record<string, string> = {};
    if (params?.status) p.status = params.status;
    if (params?.payment_status) p.payment_status = params.payment_status;
    if (params?.payment_method) p.payment_method = params.payment_method;
    if (params?.from) p.from = params.from;
    if (params?.to) p.to = params.to;
    if (params?.search) p.search = params.search;
    if (params?.per_page != null) p.per_page = String(params.per_page);
    return request<Paginated<Booking>>("/api/admin/bookings", { params: p });
  },
  getBooking(id: number): Promise<Booking> {
    return request<Booking>(`/api/admin/bookings/${id}`);
  },
  updateBooking(id: number, data: { status?: string; payment_status?: string }): Promise<Booking> {
    return request<Booking>(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  changeBookingStatus(id: number, status: string): Promise<Booking> {
    return request<Booking>(`/api/admin/bookings/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  // Payments (manual admin flow)
  approveManualPayment(id: number): Promise<{ message: string; data: { booking_id: number; payment_id: number; idempotent: boolean } }> {
    return request(`/api/admin/payments/${id}/approve`, { method: "POST" });
  },
  rejectManualPayment(id: number, data?: { reason?: string }): Promise<{ message: string } | { message: string; data?: unknown }> {
    return request(`/api/admin/payments/${id}/reject`, {
      method: "POST",
      body: data?.reason ? JSON.stringify({ reason: data.reason }) : undefined,
    });
  },

  refundBooking(id: number): Promise<{ status?: string; payment?: unknown; message?: string; data?: unknown }> {
    return request(`/api/admin/bookings/${id}/refund`, { method: "POST" });
  },

  // Certificate actions
  issueCertificate(bookingId: number): Promise<{ message: string; data: { booking_id: number; certificate_number: string } }> {
    return request(`/api/admin/bookings/issue-certificate`, { method: "POST", body: JSON.stringify({ booking_id: bookingId }) });
  },
  reissueCertificate(bookingId: number): Promise<{ message: string; data: { booking_id: number; certificate_number: string } }> {
    return request(`/api/admin/bookings/reissue-certificate`, { method: "POST", body: JSON.stringify({ booking_id: bookingId }) });
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
