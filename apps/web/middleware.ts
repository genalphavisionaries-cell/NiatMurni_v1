import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

/**
 * Protect /admin: redirect to /admin/login if not authenticated.
 * Admin panel is served at https://niatmurniacademy.com/admin (Next.js).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const session = request.cookies.get(ADMIN_SESSION_COOKIE);
  if (!session?.value) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
