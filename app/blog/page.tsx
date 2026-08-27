import type { Metadata } from "next";

import { Link } from "@heroui/link";

import { title, subtitle, container, section } from "@/components/primitives";
import BlogList from "@/components/blog/BlogList";
import { getAllBlogPosts } from "@/lib/sanity-queries";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from Peter Trinh on building for the web, shooting photo and video, and learning in public.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const revalidate = 600;

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];
  let failed = false;

  try {
    posts = await getAllBlogPosts();
  } catch {
    failed = true;
  }

  return (
    <>
      <header className={container({ width: "wide", class: "pt-16 sm:pt-20" })}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Writing</p>
            <h1 className={title({ size: "lg", class: "mt-5 max-w-2xl" })}>
              Notes from the build.
            </h1>
          </div>
          <Link
            isExternal
            className="font-mono text-xs uppercase tracking-label text-muted transition-colors hover:text-accent"
            href="/feed.xml"
          >
            RSS
          </Link>
        </div>

        <p className={subtitle({ size: "lg", class: "mt-6" })}>
          Development notes, things I got wrong the first time, and the
          occasional detour into photography.
        </p>
      </header>

      <section className={container({ width: "wide", class: section() })}>
        {failed ? (
          <div className="rounded-xl border border-dashed border-line px-8 py-16 text-center">
            <p className="eyebrow">Posts unavailable</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
              Couldn&apos;t reach the CMS just now. Try again in a moment.
            </p>
          </div>
        ) : (
          <BlogList posts={posts} />
        )}
      </section>
    </>
  );
}
