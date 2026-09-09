import { NextResponse } from "next/server";

import { encodePath, proxyJson, safeSegments } from "@/lib/sport-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/sport/matches/<...> -> upstream /api/matches/<...>
 *
 * Catch-all because the upstream feed can be one or two segments:
 * `football`, `football/popular`, `all`, `all-today`, `live`, `live/popular`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (!safeSegments(path) || path.length > 2) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  return proxyJson(`/api/matches/${encodePath(path)}`);
}
