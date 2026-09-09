import { NextResponse } from "next/server";

import {
  encodePath,
  isValidSourceName,
  proxyJson,
  safeSegments,
} from "@/lib/sport-api";

export const dynamic = "force-dynamic";

/** GET /api/sport/stream/<source>/<id> -> upstream /api/stream/<source>/<id> */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ source: string; id: string }> },
) {
  const { source, id } = await params;

  // Validated by shape, not against the documented list: the API serves
  // sources the docs never mention, and an allowlist silently hid them.
  if (!isValidSourceName(source) || !safeSegments([id])) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  return proxyJson(`/api/stream/${source}/${encodePath([id])}`);
}
