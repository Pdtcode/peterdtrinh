import { NextResponse } from "next/server";

/**
 * Server-side client for the upstream sports API.
 *
 * `SPORT_API_BASE_URL` is deliberately *not* prefixed with NEXT_PUBLIC_, so it
 * never reaches the browser bundle. The console calls our own /api/sport/*
 * routes instead, and those proxy upstream from the server — which is what
 * keeps the provider's domain out of devtools, view-source, and the network
 * tab. Every one of those routes sits behind the password gate in
 * middleware.ts, so none of this is an open relay.
 */

export type {
  APIMatch,
  APIMatchSource,
  APIMatchTeam,
  Sport,
  Stream,
} from "@/types/sport";

/**
 * The sources named in the provider's docs. Kept for reference only — do NOT
 * validate against this list. The live API returns names that never appear in
 * the docs (`admin` is by far the most common one), while six of the nine
 * below are never returned at all. Gating on it silently dropped most of the
 * available streams. Use `isValidSourceName` instead.
 */
export const STREAM_SOURCES = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "intel",
] as const;

export type StreamSource = (typeof STREAM_SOURCES)[number];

/**
 * Normalised base URL, or null if unusable.
 *
 * A bare host like `example.com` is the easy mistake to make here, and left
 * alone it produces a "Failed to parse URL" throw that surfaces as an empty
 * page rather than an error. So the scheme is filled in when missing, quotes
 * and trailing slashes are stripped, and anything still unparseable is treated
 * as not configured so the UI can say so plainly.
 */
export function sportApiBaseUrl(): string | null {
  let raw = process.env.SPORT_API_BASE_URL?.trim();

  if (!raw) return null;

  // Tolerate values pasted with surrounding quotes.
  raw = raw.replace(/^["']|["']$/g, "").replace(/\/+$/, "");

  if (!raw) return null;

  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const parsed = new URL(raw);

    // Guard against a value like "https://" alone.
    if (!parsed.hostname) return null;

    return raw;
  } catch {
    return null;
  }
}

export function isSportApiConfigured(): boolean {
  return sportApiBaseUrl() !== null;
}

/**
 * Rejects only what could actually steer the upstream path somewhere else:
 * separators, the traversal segments, and control characters.
 *
 * An allowlist of [A-Za-z0-9._-] was too strict — badge ids are base64-ish and
 * 45% of them contain "+", so half the team badges came back 400 and rendered
 * as broken images.
 */
const UNSAFE_SEGMENT = /[/\\]|^\.\.?$|[\u0000-\u001f\u007f]/;

/**
 * Validates a stream source name by shape rather than by membership of a fixed
 * list, so a new source the provider adds keeps working. This still gives the
 * property that actually matters — no traversal, no separators, nothing that
 * could steer the upstream path somewhere unintended.
 */
export function isValidSourceName(source: string): boolean {
  return /^[a-z0-9-]{1,32}$/.test(source);
}

/**
 * Guards the catch-all routes. Without this a crafted path like `../../` could
 * walk the proxy off the intended endpoint and turn it into a general-purpose
 * request forwarder.
 */
export function safeSegments(segments: string[]): boolean {
  return (
    segments.length > 0 &&
    segments.every(
      (segment) =>
        segment.length > 0 &&
        segment.length <= 512 &&
        !UNSAFE_SEGMENT.test(segment),
    )
  );
}

/**
 * Builds an upstream path from already-validated segments. Encoding each one
 * keeps characters like "+" unambiguous in transit; the upstream accepts both
 * the literal and the escaped form.
 */
export function encodePath(segments: string[]): string {
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

const TIMEOUT_MS = 12_000;

/** Raw upstream request. `path` must start with a slash. */
export async function upstreamFetch(path: string): Promise<Response> {
  const base = sportApiBaseUrl();

  if (!base) throw new Error("SPORT_API_BASE_URL is not set");

  return fetch(`${base}${path}`, {
    // Match and stream data changes constantly; never serve a stale fixture.
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
}

/**
 * Shared JSON proxy used by the sports/matches/stream routes. Upstream errors
 * are normalised so the console gets a predictable shape rather than whatever
 * HTML an origin might return on a bad day.
 */
export async function proxyJson(path: string): Promise<NextResponse> {
  if (!isSportApiConfigured()) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  try {
    const response = await upstreamFetch(path);

    if (!response.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: response.status },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Covers timeouts, DNS failures, and non-JSON bodies alike.
    return NextResponse.json(
      { error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
