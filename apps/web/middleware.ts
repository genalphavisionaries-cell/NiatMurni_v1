import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, PARTICIPANT_SESSION_COOKIE } from "@/lib/auth";

/**
 * Protect /admin: redirect to /admin/login if not authenticated.
 * Admin panel is served at https://niatmurniacademy.com/admin (Next.js).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();

    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE);
    if (!adminSession?.value) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const participantSession = request.cookies.get(PARTICIPANT_SESSION_COOKIE);
    if (!participantSession?.value) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
