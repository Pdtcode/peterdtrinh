import NextLink from "next/link";
import Image from "next/image";

import { title, subtitle, container, section } from "@/components/primitives";
import TypingAnimation from "@/components/TypingAnimation";
import ProjectCard from "@/components/ProjectCard";
import { features, siteConfig } from "@/config/site";
import { projects } from "@/config/projects";
import { getAllBlogPosts } from "@/lib/sanity-queries";

export default async function Home() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  // The blog is optional. If Sanity is unreachable the rest of the page
  // should still render.
  let recentPosts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];

  try {
    recentPosts = (await getAllBlogPosts()).slice(0, 3);
  } catch {
    recentPosts = [];
  }

  return (
    <>
      {/* Hero */}
      <section
        className={container({ width: "wide", class: "pt-16 sm:pt-24 pb-16" })}
      >
        <div className="grid gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-8">
          {/*
            Cutout portrait: tight-cropped transparent PNG in its natural
            orientation, so the shoulder he leans on faces the copy to his
            right, with a small gap so he sits beside the text rather than
            touching it. Bottom-aligned with the CTA row. Hidden below lg,
            where a 1:2.5 figure would push the copy off screen.
          */}
          <div className="relative hidden justify-self-start lg:block">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-32 rounded-full bg-accent/10 blur-3xl"
            />
            <Image
              priority
              alt=""
              className="h-auto w-[13rem] animate-fade-up [animation-delay:400ms] xl:w-[14.5rem]"
              height={1200}
              sizes="(min-width: 1280px) 14.5rem, 13rem"
              src="/peter-hero.png"
              width={473}
            />
          </div>

          <div>
            <p className="eyebrow animate-fade-up">{siteConfig.location}</p>

            <h1
              className={title({
                size: "xl",
                class: "mt-6 animate-fade-up [animation-delay:80ms]",
              })}
            >
              I turn business
              <br />
              requirements into
              <br />
              working software.
            </h1>

            <div className="mt-8 animate-fade-up [animation-delay:160ms]">
              <TypingAnimation
                className="font-mono text-base sm:text-lg text-accent"
                deletingSpeed={40}
                pauseDuration={2200}
                texts={[
                  "Full stack developer",
                  "Business analyst",
                  "Next.js · TypeScript · PostgreSQL",
                  "Problem solver",
                ]}
                typingSpeed={90}
              />
            </div>

            <p
              className={subtitle({
                size: "lg",
                class: "mt-8 animate-fade-up [animation-delay:240ms]",
              })}
            >
              I&apos;m {siteConfig.shortName}, an analyst and full-stack
              developer in Oklahoma City. Four years gathering requirements,
              analyzing processes, and driving cross-functional issues to
              closure in a regulated environment, now building and supporting
              production web applications end to end with Next.js, React,
              TypeScript, and PostgreSQL.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 animate-fade-up [animation-delay:320ms]">
              <NextLink
                className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
                href="/projects"
              >
                See the work
              </NextLink>
              <NextLink
                className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
                href="/resume"
              >
                Read the resume
              </NextLink>
            </div>
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className={container({ width: "wide", class: section() })}>
        <div className="flex items-end justify-between border-b border-line pb-4">
          <h2 className={title({ size: "sm" })}>Selected work</h2>
          <NextLink
            className="link-underline font-mono text-xs uppercase tracking-label text-muted hover:text-accent"
            href="/projects"
          >
            All work
          </NextLink>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* Availability */}
      <section className={container({ width: "wide", class: section() })}>
        <div className="rounded-2xl border border-line bg-surface p-10 sm:p-14">
          <p className="eyebrow">Currently</p>
          <h2 className={title({ size: "md", class: "mt-4 max-w-2xl" })}>
            Open to analyst and software engineering roles.
          </h2>
          <p className={subtitle({ class: "mt-5" })}>
            Looking for full-time work in the Oklahoma City metro or remote.
            Happy to walk through any of the projects above, the decisions
            behind them, and what broke along the way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-full border border-ink px-5 py-2.5 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:bg-ink hover:text-paper"
              href={`mailto:${siteConfig.email}`}
            >
              Email me
            </a>
            {features.creative && (
              <NextLink
                className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-label text-muted transition-colors hover:border-accent hover:text-accent"
                href="/creative"
              >
                Photo &amp; video
              </NextLink>
            )}
          </div>
        </div>
      </section>

      {/* Recent writing */}
      {features.writing && recentPosts.length > 0 && (
        <section className={container({ width: "wide", class: section() })}>
          <div className="flex items-end justify-between border-b border-line pb-4">
            <h2 className={title({ size: "sm" })}>Recent writing</h2>
            <NextLink
              className="link-underline font-mono text-xs uppercase tracking-label text-muted hover:text-accent"
              href="/blog"
            >
              All posts
            </NextLink>
          </div>

          <ul className="mt-4 divide-y divide-line">
            {recentPosts.map((post) => (
              <li key={post._id}>
                <NextLink
                  className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  href={`/blog/${post.slug.current}`}
                >
                  <span className="text-lg font-medium text-ink transition-colors group-hover:text-accent">
                    {post.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-label text-muted">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
