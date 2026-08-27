import type { Metadata } from "next";

import { title, subtitle, container, section } from "@/components/primitives";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/config/projects";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Software projects by Peter Trinh: internal operations tooling, e-commerce, and REST API integrations built with Next.js, TypeScript, and PostgreSQL.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <header className={container({ width: "wide", class: "pt-16 sm:pt-20" })}>
        <p className="eyebrow">Selected work</p>
        <h1 className={title({ size: "lg", class: "mt-5 max-w-3xl" })}>
          Software I&apos;ve scoped, built, and shipped.
        </h1>
        <p className={subtitle({ size: "lg", class: "mt-6" })}>
          Internal operations tooling, e-commerce, and API integrations. Each
          one taken end to end: requirements gathered from the business, data
          modeled, built, deployed, and supported in production.
        </p>
      </header>

      <section className={container({ width: "wide", class: section() })}>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className={container({ width: "wide", class: "pb-24" })}>
        <div className="rounded-2xl border border-line bg-surface p-10 text-center sm:p-14">
          <h2 className={title({ size: "sm" })}>
            Want the detail behind any of these?
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4" })}>
            I&apos;m open to full-time analyst and software engineering roles,
            and happy to walk through the requirements, the architecture, and
            the parts that went sideways.
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
