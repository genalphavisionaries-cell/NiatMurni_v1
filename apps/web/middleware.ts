import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_BACKEND_URL = "https://admin.niatmurniacademy.com";

/**
 * No proxy: /admin on the frontend is not forwarded to the backend.
 * Redirect /admin (and all /admin/*) to the Laravel Filament panel on the admin subdomain.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const target = new URL(pathname, ADMIN_BACKEND_URL);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target.toString(), 302);
}

export const config = {
  matcher: ["/admin", "/admin/(.*)"],
};
