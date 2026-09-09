import { NextResponse, type NextRequest } from "next/server";

import {
  SPORT_COOKIE,
  isSportConfigured,
  verifySessionToken,
} from "@/lib/sport-auth";

/**
 * Guards everything under /sport except the entry page itself, which renders
 * its own password form (see app/sport/page.tsx). Keeping /sport out of the
 * matcher is what stops the redirect below from looping.
 *
 * Any route handler added under /api/sport is protected the moment it exists,
 * so the streaming API can be built without re-deriving the auth check.
 */
const ALWAYS_ALLOWED = new Set(["/api/sport/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED.has(pathname)) return NextResponse.next();

  const isApi = pathname.startsWith("/api/sport");

  // With no password configured the area is treated as nonexistent rather
  // than as open, matching the 404 the /sport page returns.
  if (!isSportConfigured()) {
    return isApi
      ? NextResponse.json({ error: "not_configured" }, { status: 404 })
      : NextResponse.redirect(new URL("/", request.url));
  }

  const token = request.cookies.get(SPORT_COOKIE)?.value;

  if (await verifySessionToken(token)) return NextResponse.next();

  return isApi
    ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
    : NextResponse.redirect(new URL("/sport", request.url));
}

export const config = {
  // `:path+` requires at least one segment, which excludes /sport itself.
  matcher: ["/sport/:path+", "/api/sport/:path*"],
};
