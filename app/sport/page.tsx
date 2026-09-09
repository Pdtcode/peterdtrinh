import type { Metadata } from "next";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import SportGate from "./gate";
import SportConsole from "./console";

import { isSportApiConfigured } from "@/lib/sport-api";
import {
  SPORT_COOKIE,
  isSportConfigured,
  verifySessionToken,
} from "@/lib/sport-auth";

export const metadata: Metadata = {
  title: "Sport",
  // Belt and braces alongside the robots.txt rule: this page is unlisted, so
  // it should never end up in an index even if the URL leaks.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// The cookie decides what renders, so this can never be prerendered.
export const dynamic = "force-dynamic";

export default async function SportPage() {
  // No password set means the area is not in use; 404 rather than advertise it.
  if (!isSportConfigured()) notFound();

  const token = (await cookies()).get(SPORT_COOKIE)?.value;

  if (!(await verifySessionToken(token))) return <SportGate />;

  // Only a boolean crosses to the client — never the URL itself.
  return <SportConsole apiConfigured={isSportApiConfigured()} />;
}
