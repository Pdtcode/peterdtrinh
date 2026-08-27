import NextLink from "next/link";
import { Link } from "@heroui/link";

import { features, siteConfig } from "@/config/site";
import { InstagramIcon, LinkedinIcon } from "@/components/icons";

const columns = [
  {
    heading: "Site",
    links: [
      { label: "Work", href: "/projects" },
      { label: "Resume", href: "/resume" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "More",
    links: [
      ...(features.writing ? [{ label: "Writing", href: "/blog" }] : []),
      ...(features.creative ? [{ label: "Creative", href: "/creative" }] : []),
      { label: "Live", href: "/stream" },
    ],
  },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl text-ink">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
            <p className="eyebrow mt-5">{siteConfig.location}</p>

            <p className="eyebrow mt-6">Get in touch</p>
            <a
              className="mt-2 inline-block text-lg text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="eyebrow">{column.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <NextLink
                      className="text-sm text-muted transition-colors hover:text-accent"
                      href={link.href}
                    >
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col-reverse items-start gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted">
            © {year} {siteConfig.shortName}. {siteConfig.tagline}.
          </p>
          <div className="flex items-center gap-5">
            <Link
              isExternal
              aria-label="LinkedIn"
              href={siteConfig.links.linkedin}
            >
              <LinkedinIcon
                className="text-muted transition-colors hover:text-ink"
                size={20}
              />
            </Link>
            <Link
              isExternal
              aria-label="Instagram"
              href={siteConfig.links.instagram}
            >
              <InstagramIcon
                className="text-muted transition-colors hover:text-ink"
                size={20}
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
