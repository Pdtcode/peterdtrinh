import type { Metadata } from "next";

import Image from "next/image";
import { notFound } from "next/navigation";
import clsx from "clsx";

import { title, subtitle, container, section } from "@/components/primitives";
import { photos, videos, services } from "@/config/creative";
import { features, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Creative",
  description:
    "Photography and videography by Peter Trinh: commercial, event, and portrait work in Oklahoma City.",
  alternates: { canonical: "/creative" },
  // Keep it out of search results while the page is hidden.
  robots: features.creative ? undefined : { index: false, follow: false },
};

const spanClass = {
  normal: "row-span-1",
  tall: "row-span-2",
  wide: "sm:col-span-2",
} as const;

function EmptyState({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-8 py-14 text-center">
      <p className="eyebrow">{label}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {note}
      </p>
      <a
        className="mt-6 inline-block font-mono text-xs uppercase tracking-label text-accent hover:underline"
        href={`mailto:${siteConfig.email}`}
      >
        Ask to see the portfolio
      </a>
    </div>
  );
}

export default function CreativePage() {
  // Hidden until there is work in config/creative.ts. Flip features.creative
  // in config/site.ts to bring the page back.
  if (!features.creative) notFound();

  return (
    <>
      <header className={container({ width: "wide", class: "pt-16 sm:pt-20" })}>
        <p className="eyebrow">Photography &amp; video</p>
        <h1 className={title({ size: "lg", class: "mt-5 max-w-3xl" })}>
          Stills and motion out of Oklahoma City.
        </h1>
        <p className={subtitle({ size: "lg", class: "mt-6" })}>
          I shoot commercial, event, and portrait work, and cut the video that
          goes with it. Most of it ends up on the sites I build.
        </p>
      </header>

      {/* Photography */}
      <section className={container({ width: "wide", class: section() })}>
        <div className="flex items-end justify-between border-b border-line pb-4">
          <h2 className={title({ size: "sm" })}>Photography</h2>
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            {photos.length > 0 ? `${photos.length} frames` : "In progress"}
          </p>
        </div>

        <div className="mt-10">
          {photos.length > 0 ? (
            <div className="grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <figure
                  key={photo.src}
                  className={clsx(
                    "group relative overflow-hidden rounded-lg border border-line bg-surface",
                    spanClass[photo.span ?? "normal"],
                  )}
                >
                  <Image
                    fill
                    alt={photo.alt}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={photo.src}
                  />
                  {photo.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 font-mono text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState
              label="Gallery being assembled"
              note="I'm putting together a proper selection of recent frames. In the meantime, reach out and I'll send work relevant to what you need."
            />
          )}
        </div>
      </section>

      {/* Video */}
      <section className={container({ width: "wide", class: section() })}>
        <div className="flex items-end justify-between border-b border-line pb-4">
          <h2 className={title({ size: "sm" })}>Video</h2>
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            {videos.length > 0 ? `${videos.length} pieces` : "In progress"}
          </p>
        </div>

        <div className="mt-10">
          {videos.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {videos.map((video) => (
                <article
                  key={video.embed}
                  className="overflow-hidden rounded-xl border border-line bg-surface"
                >
                  <div className="aspect-video bg-paper">
                    <iframe
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="h-full w-full"
                      loading="lazy"
                      src={video.embed}
                      title={video.title}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold tracking-tight text-ink">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {video.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              label="Reel in the edit"
              note="Recent video work is still being cut together. Get in touch if you'd like to see raw examples of brand spots or event coverage."
            />
          )}
        </div>
      </section>

      {/* Services */}
      <section className={container({ width: "wide", class: section() })}>
        <div className="border-b border-line pb-4">
          <h2 className={title({ size: "sm" })}>What I shoot</h2>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.heading} className="bg-surface p-8">
              <h3 className="font-mono text-xs uppercase tracking-label text-accent">
                {service.heading}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {service.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={container({ width: "wide", class: "pb-24" })}>
        <div className="rounded-2xl border border-line bg-surface p-10 text-center sm:p-14">
          <h2 className={title({ size: "sm" })}>Need something shot?</h2>
          <p className={subtitle({ class: "mx-auto mt-4" })}>
            Tell me the date, the location, and what you&apos;re after.
            I&apos;ll come back with availability and a quote.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
              href={`mailto:${siteConfig.email}`}
            >
              Email me
            </a>
            <a
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
              href={siteConfig.links.instagram}
              rel="noreferrer"
              target="_blank"
            >
              More on Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
