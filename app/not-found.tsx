import NextLink from "next/link";

import { title, subtitle, container } from "@/components/primitives";

export default function NotFound() {
  return (
    <section
      className={container({
        width: "narrow",
        class: "flex min-h-[60vh] flex-col justify-center py-24",
      })}
    >
      <p className="eyebrow">404</p>
      <h1 className={title({ size: "md", class: "mt-5" })}>
        This page doesn&apos;t exist.
      </h1>
      <p className={subtitle({ class: "mt-5" })}>
        The link may be old, or I may have moved something. Here&apos;s the way
        back.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <NextLink
          className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
          href="/"
        >
          Go home
        </NextLink>
        <NextLink
          className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
          href="/projects"
        >
          See the work
        </NextLink>
      </div>
    </section>
  );
}
