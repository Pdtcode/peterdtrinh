import type { Metadata } from "next";

import { Link } from "@heroui/link";

import {
  title,
  subtitle,
  container,
  section,
  tag,
} from "@/components/primitives";
import { resume } from "@/config/resume";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Peter Trinh's resume: analyst and full-stack developer in the Oklahoma City metro. Next.js, React, TypeScript, and PostgreSQL, with four years in regulated operations.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <>
      <header
        className={container({ width: "default", class: "pt-16 sm:pt-20" })}
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Resume</p>
            <h1 className={title({ size: "lg", class: "mt-5" })}>
              {siteConfig.name}
            </h1>
            <p className="mt-3 font-mono text-sm text-muted">
              {siteConfig.role} · {siteConfig.location}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              isExternal
              className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
              href="/peter-trinh-resume.pdf"
            >
              Download PDF
            </Link>
            <Link
              isExternal
              className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
              href={siteConfig.links.linkedin}
            >
              LinkedIn
            </Link>
            <Link
              className="rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
              href={`mailto:${siteConfig.email}`}
            >
              Email me
            </Link>
          </div>
        </div>

        <p className={subtitle({ size: "lg", class: "mt-8" })}>
          {resume.summary}
        </p>

        <div className="mt-10">
          <h2 className="eyebrow">Core competencies</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {resume.competencies.map((item) => (
              <span key={item} className={tag()}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Experience */}
      <section className={container({ width: "default", class: section() })}>
        <h2
          className={title({ size: "sm", class: "border-b border-line pb-4" })}
        >
          Experience
        </h2>

        <div className="mt-10 space-y-12">
          {resume.experience.map((job) => (
            <article
              key={`${job.org}-${job.role}`}
              className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-label text-muted sm:pt-1.5">
                {job.period}
              </p>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {job.role}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {job.org} · {job.location}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {job.points.map((point) => (
                    <li
                      key={point}
                      className="relative pl-5 text-base leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-accent"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className={container({ width: "default", class: section() })}>
        <h2
          className={title({ size: "sm", class: "border-b border-line pb-4" })}
        >
          Skills
        </h2>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {resume.skills.map((group) => (
            <div key={group.heading}>
              <h3 className="eyebrow">{group.heading}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className={tag()}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className={container({ width: "default", class: section() })}>
        <h2
          className={title({ size: "sm", class: "border-b border-line pb-4" })}
        >
          Education
        </h2>

        <div className="mt-10 space-y-8">
          {resume.education.map((entry) => (
            <article
              key={entry.credential}
              className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <p className="font-mono text-xs uppercase tracking-label text-muted sm:pt-1.5">
                {entry.period}
              </p>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {entry.credential}
                </h3>
                <p className="mt-1 text-sm text-muted">{entry.org}</p>
                {entry.note && (
                  <p className="mt-3 max-w-prose text-base leading-relaxed text-muted">
                    {entry.note}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={container({ width: "default", class: "pb-24" })}>
        <div className="rounded-2xl border border-line bg-surface p-10 sm:p-12">
          <h2 className={title({ size: "sm" })}>Looking for someone?</h2>
          <p className={subtitle({ class: "mt-4" })}>
            I&apos;m open to freelance projects and the right full-time role.
            Happy to walk through any of the above in more detail.
          </p>
          <a
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
            href={`mailto:${siteConfig.email}`}
          >
            Email me
          </a>
        </div>
      </section>
    </>
  );
}
