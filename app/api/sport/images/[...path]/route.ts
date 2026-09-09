import { NextResponse } from "next/server";

import {
  encodePath,
  isSportApiConfigured,
  safeSegments,
  upstreamFetch,
} from "@/lib/sport-api";

/**
 * GET /api/sport/images/<...> -> upstream /api/images/<...>
 *
 * Badges and posters live on the provider's domain, so rendering them straight
 * from source would leak the base URL through every <img> tag. Streaming the
 * bytes back through here keeps the page origin-clean.
 *
 * Handles all three documented shapes:
 *   badge/<id>.webp
 *   poster/<badge>/<badge>.webp
 *   proxy/<poster>.webp
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (!safeSegments(path) || path.length > 3) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!isSportApiConfigured()) {
    return NextResponse.json({ error: "api_not_configured" }, { status: 503 });
  }

  try {
    const upstream = await upstreamFetch(`/api/images/${encodePath(path)}`);

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/webp",
        // Badges and posters are static per match, so let the browser keep them.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
