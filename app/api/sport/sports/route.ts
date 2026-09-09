import { proxyJson } from "@/lib/sport-api";

export const dynamic = "force-dynamic";

/** GET /api/sport/sports -> upstream /api/sports */
export async function GET() {
  return proxyJson("/api/sports");
}
