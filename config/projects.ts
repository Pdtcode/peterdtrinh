export interface Project {
  slug: string;
  title: string;
  year: string;
  category: string;
  description: string;
  url: string;
  technologies: string[];
  /**
   * Short status line for anything a visitor would otherwise hit as a dead
   * end, e.g. a site that is temporarily behind a password. Rendered under
   * the description, above the tech tags.
   */
  note?: string;
  /** Feature on the home page. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "patriot-logistic-solutions",
    title: "Patriot Logistic Solutions",
    year: "2026",
    category: "Internal Tooling · Full Stack",
    description:
      "A federal contracting firm that bids on government procurement and connects vendors to contracts. I gathered requirements from the owners, then built the public site and an internal operations tool: it integrates the SAM.gov API to surface NAICS-coded contract opportunities, consolidates every contract document in one place, and tracks each contract through its lifecycle on a kanban board.",
    url: "https://patriotlogisticsolutions.com/",
    technologies: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "SAM.gov API",
      "REST Integration",
    ],
    featured: true,
  },
  {
    slug: "gs-design-research",
    title: "GS Design Research",
    year: "2024",
    category: "E-commerce · Full Stack",
    description:
      "A full e-commerce platform for an Oklahoma apparel brand. Stripe-powered checkout on a relational data model covering inventory, products, orders, and discount codes, exposed through a Sanity headless CMS so the client runs the store without me. Includes an event-driven product drop page for timed releases.",
    url: "https://gsdesignresearch.com",
    note: "The live site is password protected at the moment while the team gets a new release ready for their community.",
    technologies: [
      "Next.js",
      "TypeScript",
      "PostgreSQL (Neon)",
      "Stripe",
      "Sanity CMS",
    ],
    featured: true,
  },
  {
    slug: "han-jan",
    title: "Han Jan Korean Kitchen & Pocha",
    year: "2025",
    category: "Web App · Production Support",
    description:
      "A site for a Korean late-night spot in Oklahoma City: online menu, reservations, ordering, catering enquiries, events, and newsletter signup. Now ranks on page one for local search, drawing ~17K monthly impressions and ~400 organic clicks, with ongoing Core Web Vitals monitoring and remediation in Google Search Console.",
    url: "https://hanjanpochaok.com",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Core Web Vitals"],
    featured: true,
  },
];

/**
 * Live preview thumbnails come from screenshotmachine. The key is read from the
 * environment so it is not committed; without it the cards fall back to a
 * typographic placeholder.
 */
export function previewUrl(url: string): string | null {
  const key = process.env.NEXT_PUBLIC_SCREENSHOT_KEY;

  if (!key) return null;

  return `https://api.screenshotmachine.com?key=${key}&url=${encodeURIComponent(
    url,
  )}&dimension=1024x768`;
}
