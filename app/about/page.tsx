import type { Metadata } from "next";

import Image from "next/image";
import NextLink from "next/link";

import { title, subtitle, container, section } from "@/components/primitives";
import { features, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Peter Trinh, analyst and full-stack developer in Oklahoma City. Chemical engineering from OU, four years in regulated operations, now building production web applications.",
  alternates: { canonical: "/about" },
};

interface FallingCard {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

const cards: FallingCard[] = [
  { id: 0, left: 10, delay: -2, duration: 10 },
  { id: 1, left: 25, delay: -8, duration: 9 },
  { id: 2, left: 40, delay: -5, duration: 11 },
  { id: 3, left: 55, delay: -11, duration: 8 },
  { id: 4, left: 70, delay: -3, duration: 12 },
  { id: 5, left: 85, delay: -9, duration: 10 },
  { id: 6, left: 15, delay: -6, duration: 9 },
  { id: 7, left: 90, delay: -1, duration: 11 },
];

const facts = [
  { label: "Based in", value: `${siteConfig.location} (OKC metro)` },
  { label: "Studied", value: "B.S. Chemical Engineering, OU" },
  { label: "Core stack", value: "Next.js · TypeScript · PostgreSQL" },
  { label: "Looking for", value: "Analyst or software engineering roles" },
];

export default function AboutPage() {
  return (
    <>
      {/* Ambient falling cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="absolute opacity-20"
            style={{
              left: `${card.left}%`,
              animation: `fall ${card.duration}s linear infinite ${card.delay}s`,
            }}
          >
            <Image
              alt=""
              className="rotate-12 transform"
              height={90}
              src="/transparent-card.png"
              width={60}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <header
          className={container({ width: "default", class: "pt-16 sm:pt-20" })}
        >
          {/*
            Capped at max-w-3xl so the portrait lands just past the body copy's
            measure below, instead of floating at the far edge of the wider
            page container.
          */}
          <div className="grid max-w-3xl gap-8 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10">
            <div>
              <p className="eyebrow">About</p>
              <h1 className={title({ size: "lg", class: "mt-5" })}>
                Hi, I&apos;m Peter.
              </h1>
              <p className={subtitle({ size: "lg", class: "mt-6" })}>
                An analyst and full-stack developer in Oklahoma City. I sit
                between the people who have the problem and the software that
                solves it.
              </p>
            </div>

            <Image
              priority
              alt="Peter Trinh"
              className="order-first h-36 w-36 rounded-2xl border border-line object-cover shadow-sm sm:order-none sm:h-44 sm:w-44"
              height={576}
              src="/peter-portrait.jpg"
              width={576}
            />
          </div>
        </header>

        <section className={container({ width: "default", class: section() })}>
          <div className="max-w-prose space-y-6 text-lg leading-relaxed text-ink">
            <p>
              I spent four years at{" "}
              <span className="font-medium">Cytovance Biologic</span>, first on
              the manufacturing floor and then as a quality control analyst.
              That job was, underneath the regulatory vocabulary, business
              analysis: map how a process actually runs, document what it is
              supposed to do, find where the two diverge, and drive the fix
              through cross-functional teams until it is closed and written
              down. I got good at asking the question that makes the real
              requirement fall out.
            </p>
            <p>
              Alongside it I taught myself to build. Now I ship production web
              applications end to end: requirements, data model, API
              integrations, deployment, and the unglamorous part where you
              monitor it and fix what breaks. The most useful thing I&apos;ve
              built is an internal operations tool for a federal contracting
              firm: it pulls NAICS-coded opportunities from the SAM.gov API,
              keeps every contract document in one place, and moves contracts
              across a kanban board through their lifecycle. That project is the
              honest summary of what I do: a business problem, translated.
            </p>
            <p>
              My degree is in chemical engineering from the{" "}
              <span className="font-medium">University of Oklahoma</span>. It
              gave me the useful half of itself: break the hard thing into
              smaller things, check your assumptions, then build. I&apos;m
              currently looking for full-time analyst or software engineering
              work in the OKC metro or remote.
            </p>
            <p>
              Away from the keyboard I shoot photo and video, play tennis, and
              turn over startup ideas that keep the imagination sharp.
              {features.creative && (
                <>
                  {" "}
                  Some of that lands{" "}
                  <NextLink
                    className="text-accent underline underline-offset-4"
                    href="/creative"
                  >
                    over here
                  </NextLink>
                  .
                </>
              )}{" "}
              I try not to limit myself to one lane. The approach is simple:{" "}
              <span className="font-medium italic text-accent">
                {siteConfig.tagline}
              </span>
              .
            </p>
          </div>
        </section>

        <section
          className={container({ width: "default", class: "pb-10 sm:pb-14" })}
        >
          <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-surface p-6">
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="mt-2 text-base text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={container({ width: "default", class: "pb-24" })}>
          <div className="flex flex-wrap gap-3">
            <NextLink
              className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-label text-paper transition-opacity hover:opacity-85"
              href="/resume"
            >
              Read the resume
            </NextLink>
            <NextLink
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
              href="/projects"
            >
              See the work
            </NextLink>
          </div>
        </section>
      </div>
    </>
  );
}
