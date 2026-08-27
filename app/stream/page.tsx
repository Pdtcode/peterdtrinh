import type { Metadata } from "next";

import NextLink from "next/link";
import { headers } from "next/headers";
import { Link } from "@heroui/link";

import { title, subtitle, container, section } from "@/components/primitives";
import { features, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Live",
  description:
    "Watch Peter Trinh stream live: building side projects, playing TFT and League, and whatever else is on the desk.",
  alternates: { canonical: "/stream" },
};

/**
 * Builds the player for whichever channel is `primary`. Twitch embeds require
 * the host domain in a `parent` query param, so that URL has to come from the
 * actual request host at render time. The YouTube live_stream embed only
 * accepts a UC... channel ID, so a handle alone cannot be embedded.
 */
async function buildEmbedUrl(): Promise<string | null> {
  const { primary, twitch, youtube } = siteConfig.stream;

  if (primary === "youtube") {
    return youtube.channelId
      ? `https://www.youtube.com/embed/live_stream?channel=${youtube.channelId}`
      : null;
  }

  if (!twitch.channel) return null;

  const host = (await headers()).get("host") ?? new URL(siteConfig.url).host;
  const parent = host.split(":")[0];

  return `https://player.twitch.tv/?channel=${twitch.channel}&parent=${parent}`;
}

/** Public channel pages, useful when the embed is dark because I'm offline. */
function channelLinks(): { label: string; href: string }[] {
  const { twitch, youtube } = siteConfig.stream;
  const links: { label: string; href: string }[] = [];

  if (twitch.channel) {
    links.push({
      label: "Follow on Twitch",
      href: `https://twitch.tv/${twitch.channel}`,
    });
  }

  if (youtube.handle) {
    links.push({
      label: "Subscribe on YouTube",
      href: `https://www.youtube.com/@${youtube.handle}`,
    });
  } else if (youtube.channelId) {
    links.push({
      label: "Subscribe on YouTube",
      href: `https://www.youtube.com/channel/${youtube.channelId}`,
    });
  }

  return links;
}

export default async function StreamPage() {
  const embedUrl = await buildEmbedUrl();
  const links = channelLinks();

  return (
    <>
      <header className={container({ width: "wide", class: "pt-16 sm:pt-20" })}>
        <p className="eyebrow">Live</p>
        <h1 className={title({ size: "lg", class: "mt-5 max-w-3xl" })}>
          Watch me work.
        </h1>
        <p className={subtitle({ size: "lg", class: "mt-6" })}>
          I stream now and then: side projects, TFT, and League. If the player
          below is dark, I&apos;m offline.
        </p>
      </header>

      <section className={container({ width: "wide", class: section() })}>
        {embedUrl ? (
          <div className="overflow-hidden rounded-xl border border-line bg-black">
            <div className="aspect-video">
              <iframe
                allowFullScreen
                className="h-full w-full"
                src={embedUrl}
                title={`${siteConfig.shortName} live stream`}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line px-8 py-20 text-center">
            <p className="eyebrow">Player not configured</p>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
              The links below still work. To embed the player, set{" "}
              <code className="font-mono text-sm text-ink">
                siteConfig.stream
              </code>{" "}
              in{" "}
              <code className="font-mono text-sm text-ink">config/site.ts</code>
              . YouTube needs a UC... channel ID, not a handle.
            </p>
          </div>
        )}
      </section>

      <section className={container({ width: "wide", class: "pb-24" })}>
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {[
            {
              heading: "What I stream",
              body: "Building sites and side projects, plus TFT and League when I want to think about something that isn't work.",
            },
            {
              heading: "When",
              body: "Irregularly. Best way to catch one is to follow on Twitch or subscribe on YouTube and get the notification.",
            },
            {
              heading: "Say hi",
              body: "Chat's open. Questions about the stack, or about why that TFT comp didn't work, are equally welcome.",
            },
          ].map((item) => (
            <div key={item.heading} className="bg-surface p-8">
              <h2 className="font-mono text-xs uppercase tracking-label text-accent">
                {item.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              isExternal
              className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {features.writing && (
            <NextLink
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
              href="/blog"
            >
              Read the writing
            </NextLink>
          )}
          <a
            className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
            href={`mailto:${siteConfig.email}`}
          >
            Email me
          </a>
        </div>
      </section>
    </>
  );
}
