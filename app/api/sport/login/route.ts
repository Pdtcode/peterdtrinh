import { NextResponse } from "next/server";

import {
  SESSION_MAX_AGE_SECONDS,
  SPORT_COOKIE,
  checkPassword,
  createSessionToken,
  isSportConfigured,
} from "@/lib/sport-auth";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

/**
 * Best-effort throttle. It lives in module scope, so it resets on redeploy and
 * is per-instance rather than global — enough to make online guessing tedious,
 * not a substitute for choosing a long password.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  return forwarded?.split(",")[0].trim() || "unknown";
}

function isThrottled(key: string, now: number): boolean {
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) return false;

  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string, now: number): void {
  const entry = attempts.get(key);

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });

    return;
  }

  entry.count += 1;
}

export async function POST(request: Request) {
  if (!isSportConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 404 });
  }

  const now = Date.now();
  const key = clientKey(request);

  if (isThrottled(key, now)) {
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await checkPassword(password))) {
    recordFailure(key, now);

    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await createSessionToken(now);

  if (!token) {
    return NextResponse.json({ error: "not_configured" }, { status: 404 });
  }

  attempts.delete(key);

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SPORT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
