import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, PARTICIPANT_SESSION_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Backward compatibility redirect for legacy participant URLs.
  if (pathname.startsWith("/participant")) {
    const nextPath = pathname.replace(/^\/participant/, "/user") || "/user";
    const target = new URL(nextPath, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 307);
  }

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

  if (pathname.startsWith("/user")) {
    if (pathname.startsWith("/user/login")) return NextResponse.next();

    const participantSession = request.cookies.get(PARTICIPANT_SESSION_COOKIE);
    if (!participantSession?.value) {
      const login = new URL("/user/login", request.url);
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/participant/:path*"],
};
