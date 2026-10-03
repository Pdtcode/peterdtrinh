"use client";

import type { APIMatch, APIMatchSource, Stream } from "@/types/sport";

import { useCallback, useEffect, useRef, useState } from "react";

import { title, container } from "@/components/primitives";

/**
 * The private streaming workspace.
 *
 * Every request here goes to our own /api/sport/* proxy, never to the provider
 * directly, so `SPORT_API_BASE_URL` stays server-side. The one unavoidable
 * exception is the player iframe: `embedUrl` comes back from the upstream API
 * and has to be loaded by the browser to play anything, so that host is
 * visible in the DOM once a stream is selected. The page is password-gated, so
 * only someone already through the gate ever sees it.
 */

/**
 * The sports worth opening the page for. `fight` is the API's single category
 * for UFC and boxing — there is no `mma` or `boxing` endpoint. `american-
 * football` covers NFL (and college).
 */
const FAVORITE_SPORTS = [
  "american-football",
  "fight",
  "basketball",
  "tennis",
] as const;

/**
 * What the list is narrowed to. "mine" is the default and covers the sports
 * worth opening the page for; the rest are escape hatches. Live games are not
 * a scope — they are pinned to the top of whatever is selected, so there is no
 * mode to be in the wrong one of.
 */
const SCOPES = [
  { id: "mine", label: "My sports" },
  { id: "american-football", label: "NFL" },
  { id: "fight", label: "UFC & boxing" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
  { id: "all", label: "Everything" },
] as const;

/** Display names for the API's category slugs; anything else is title-cased. */
const CATEGORY_LABELS: Record<string, string> = {
  "american-football": "Football",
  fight: "Fight",
};

/** Live status goes stale fast, so the list quietly reloads on this cadence. */
const AUTO_REFRESH_MS = 2 * 60 * 1000;

/**
 * How long a "no streams anywhere" verdict is trusted. Upcoming games often
 * gain streams shortly before kickoff, so a dead match is re-asked after this
 * — but stays hidden while it is, rather than flickering back into the list.
 */
const EMPTY_PROBE_TTL_MS = 5 * 60 * 1000;

const STORAGE = {
  blockPopups: "sport.blockPopups",
  scope: "sport.scope",
} as const;

const badgeUrl = (badge: string) =>
  `/api/sport/images/badge/${encodeURIComponent(badge)}.webp`;

/**
 * `match.poster` is not the bare id the docs describe — every value the API
 * returns is already a complete path, e.g. "/api/images/proxy/<id>.webp".
 * Wrapping that in encodeURIComponent produced a nonsense URL and broke every
 * poster, so re-point the path at our proxy instead. The documented bare-id
 * form is still handled in case it ever shows up.
 */
const posterUrl = (poster: string) => {
  const prefix = "/api/images/";

  if (poster.startsWith(prefix)) {
    return `/api/sport/images/${poster.slice(prefix.length)}`;
  }

  return `/api/sport/images/proxy/${encodeURIComponent(poster)}.webp`;
};

function categoryLabel(category: string): string {
  return (
    CATEGORY_LABELS[category] ??
    category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function formatKickoff(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

/** Just the clock, for rows already grouped under a day. */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "in 25m" / "in 2h 10m" — only for the near future, where it beats a clock. */
function formatCountdown(timestamp: number, now: number): string | null {
  const minutes = Math.round((timestamp - now) / 60_000);

  if (minutes <= 0 || minutes >= 6 * 60) return null;
  if (minutes < 60) return `in ${minutes}m`;

  const rest = minutes % 60;

  return `in ${Math.floor(minutes / 60)}h${rest ? ` ${rest}m` : ""}`;
}

const compactNumber = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * The API can list the same {source, id} pair twice on one match, which
 * duplicated React keys and fired the same request twice. Collapse them so one
 * button means one distinct source.
 */
function uniqueSources(match: APIMatch): APIMatchSource[] {
  const seen = new Set<string>();

  return match.sources.filter((source) => {
    const key = `${source.source}-${source.id}`;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });
}

const matchKey = (match: APIMatch) => `${match.id}-${match.date}`;
const sourceKey = (source: APIMatchSource) => `${source.source}-${source.id}`;

function inScopeOf(scope: string, match: APIMatch): boolean {
  if (scope === "all") return true;
  if (scope === "mine") {
    return FAVORITE_SPORTS.includes(
      match.category as (typeof FAVORITE_SPORTS)[number],
    );
  }

  return match.category === scope;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

/** A probe verdict: does any source have a stream, and when was that asked. */
type Probe = { ok: boolean; at: number };

export default function SportConsole({
  apiConfigured,
}: {
  apiConfigured: boolean;
}) {
  const [scope, setScope] = useState<string>("mine");
  const [query, setQuery] = useState("");
  /** Keys of the matches the API currently reports as live. */
  const [liveKeys, setLiveKeys] = useState<Set<string>>(new Set());

  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  /** False until the first load settles, so "no games" never flashes first. */
  const [hasLoaded, setHasLoaded] = useState(false);
  const [matchesError, setMatchesError] = useState("");

  const [selectedMatch, setSelectedMatch] = useState<APIMatch | null>(null);
  const [selectedSource, setSelectedSource] = useState<APIMatchSource | null>(
    null,
  );

  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState("");
  const [activeStream, setActiveStream] = useState<Stream | null>(null);

  /** Ticks once a minute so countdowns ("in 25m") stay honest. */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);

    return () => window.clearInterval(id);
  }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  /**
   * `sandbox` is the only thing in HTML that stops an iframe calling
   * window.open, so it is the only way to kill the popunder ads from here.
   *
   * Two separate detectors work against that, and neither can be satisfied
   * while still blocking popups:
   *
   *   - The outer wrapper calls window.open() and treats a null return as
   *     proof of sandboxing, caching that verdict for an hour.
   *   - The inner player writes `document.domain = document.domain` and
   *     catches the throw. The HTML spec sets the "sandboxed document.domain"
   *     flag whenever the sandbox attribute is present at all, and no allow-*
   *     token clears it — so adding allow-popups does NOT get past this one.
   *     This is the check behind "SANDBOX IFRAME NOT ALLOWED".
   *
   * Popups also cannot be intercepted or retargeted from here: the frame is
   * cross-origin, so its window.open is unreachable. Neutralising it is a
   * browser-side job (an ad blocker), not a page-side one.
   *
   * Left as a per-viewer switch rather than decided here; the default is
   * playback, since a blocked stream is useless.
   */
  const [blockPopups, setBlockPopups] = useState(false);

  // Read after mount: localStorage is unavailable during SSR, and touching it
  // in the initial state would desync hydration.
  useEffect(() => {
    try {
      setBlockPopups(localStorage.getItem(STORAGE.blockPopups) === "1");

      const savedScope = localStorage.getItem(STORAGE.scope);

      if (SCOPES.some((option) => option.id === savedScope)) {
        setScope(savedScope as string);
      }
    } catch {
      // Private windows and blocked site data throw here; the default is fine.
    }
  }, []);

  function togglePopupBlocking() {
    setBlockPopups((previous) => {
      const next = !previous;

      try {
        localStorage.setItem(STORAGE.blockPopups, next ? "1" : "0");
      } catch {
        // Preference just will not persist; not worth surfacing.
      }

      return next;
    });
  }

  function changeScope(next: string) {
    setScope(next);

    try {
      localStorage.setItem(STORAGE.scope, next);
    } catch {
      // As above.
    }
  }

  async function signOut() {
    await fetch("/api/sport/logout", { method: "POST" });
    window.location.href = "/";
  }

  /**
   * Probe verdicts by match key. Kept across reloads so a refresh does not
   * reset the list to "everything, unchecked" and then shrink it again.
   */
  const [probes, setProbes] = useState<Record<string, Probe>>({});
  const probesRef = useRef(probes);

  probesRef.current = probes;

  /** Bumped by every load so the probe re-runs even if the list is unchanged. */
  const [probeEpoch, setProbeEpoch] = useState(0);
  /** Set by a manual refresh: re-ask every dead match, not just expired ones. */
  const forceProbeRef = useRef(false);

  const loadMatches = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!apiConfigured) return;

      setMatchesLoading(true);
      setMatchesError("");

      try {
        // Both feeds every time: "live" says what is on right now, "all-today"
        // gives the day's schedule. Merging them means live games can be
        // pinned in place rather than hidden behind a separate tab.
        const [live, today] = await Promise.all([
          getJson<APIMatch[]>("/api/sport/matches/live").catch(
            () => [] as APIMatch[],
          ),
          getJson<APIMatch[]>("/api/sport/matches/all-today").catch(
            () => [] as APIMatch[],
          ),
        ]);

        const liveList = Array.isArray(live) ? live : [];
        const todayList = Array.isArray(today) ? today : [];

        setLiveKeys(new Set(liveList.map(matchKey)));

        const seen = new Set<string>();
        const merged = [...liveList, ...todayList].filter((match) => {
          const key = matchKey(match);

          if (seen.has(key)) return false;

          seen.add(key);

          return true;
        });

        if (merged.length === 0 && liveList.length === 0) {
          setMatchesError("Could not load the schedule.");
        }

        setMatches(merged);
      } catch (error) {
        setMatches([]);
        setMatchesError(
          error instanceof Error ? error.message : "Could not load matches.",
        );
      } finally {
        if (options.force) forceProbeRef.current = true;
        setProbeEpoch((epoch) => epoch + 1);
        setMatchesLoading(false);
        setHasLoaded(true);
      }
    },
    [apiConfigured],
  );

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Keep live status fresh without a click: reload on a timer while the tab is
  // visible, and straight away when coming back to it.
  useEffect(() => {
    if (!apiConfigured) return;

    const reloadIfVisible = () => {
      if (document.visibilityState === "visible") loadMatches();
    };
    const id = window.setInterval(reloadIfVisible, AUTO_REFRESH_MS);

    document.addEventListener("visibilitychange", reloadIfVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", reloadIfVisible);
    };
  }, [apiConfigured, loadMatches]);

  // Bumped on every match/source selection so a slow response from an earlier
  // click cannot overwrite the results of a later one.
  const requestRef = useRef(0);

  const fetchStreams = useCallback(
    (source: APIMatchSource) =>
      getJson<Stream[]>(
        `/api/sport/stream/${source.source}/${encodeURIComponent(source.id)}`,
      ).then((data) => (Array.isArray(data) ? data : [])),
    [],
  );

  /** Cache of every source's streams for the selected match, keyed source-id. */
  const [sourceStreams, setSourceStreams] = useState<Record<string, Stream[]>>(
    {},
  );

  /** Switching sources reads the cache filled by selectMatch — no refetch. */
  function pickSource(source: APIMatchSource, stream?: Stream) {
    const list = sourceStreams[sourceKey(source)] ?? [];

    setSelectedSource(source);
    setStreams(list);
    setActiveStream(stream ?? list[0] ?? null);
    setStreamsError(list.length === 0 ? "No streams on this source." : "");
  }

  async function selectMatch(match: APIMatch) {
    const request = (requestRef.current += 1);

    setSelectedMatch(match);
    setStreams([]);
    setActiveStream(null);
    setStreamsError("");
    setSelectedSource(null);
    setSourceStreams({});

    // Below lg the list sits under the player, so bring the player back up.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const sources = uniqueSources(match);

    if (sources.length === 0) {
      setStreamsError("This match has no sources.");

      return;
    }

    setStreamsLoading(true);

    // Probe every source at once rather than stopping at the first that
    // answers. A source with nothing on it returns 200 with an empty array,
    // so the only way to show which ones actually have streams is to ask them
    // all — and in parallel that costs one round trip, not N.
    const results = await Promise.all(
      sources.map((source) =>
        fetchStreams(source)
          .then((list) => ({ source, list }))
          .catch(() => ({ source, list: [] as Stream[] })),
      ),
    );

    if (request !== requestRef.current) return;

    const cache: Record<string, Stream[]> = {};

    results.forEach(({ source, list }) => {
      cache[sourceKey(source)] = list;
    });

    const firstWithStreams = results.find((entry) => entry.list.length > 0);

    setSourceStreams(cache);
    setStreamsLoading(false);

    if (firstWithStreams) {
      setSelectedSource(firstWithStreams.source);
      setStreams(firstWithStreams.list);
      setActiveStream(firstWithStreams.list[0]);
    } else {
      setSelectedSource(sources[0]);
      setStreamsError("No streams on any source for this match yet.");
    }
  }

  /**
   * Every stream on the selected match across all sources, in button order —
   * what "Try next stream" walks through when the current one is dead.
   */
  const allStreams = selectedMatch
    ? uniqueSources(selectedMatch).flatMap((source) =>
        (sourceStreams[sourceKey(source)] ?? []).map((stream) => ({
          source,
          stream,
        })),
      )
    : [];

  function tryNextStream() {
    if (allStreams.length < 2) return;

    const index = allStreams.findIndex(
      (entry) =>
        entry.stream === activeStream &&
        selectedSource !== null &&
        sourceKey(entry.source) === sourceKey(selectedSource),
    );
    const next = allStreams[(index + 1) % allStreams.length];

    pickSource(next.source, next.stream);
  }

  // Everything the current scope covers, before the search box narrows it.
  const inScope = matches.filter((match) => inScopeOf(scope, match));

  // inScope is a fresh array every render, so the probe keys off a stable
  // signature of it and reads the latest value through a ref.
  const inScopeKeys = inScope.map(matchKey);
  const inScopeSignature = inScopeKeys.join("|");
  const inScopeRef = useRef(inScope);

  inScopeRef.current = inScope;

  // Probes the scoped list a few at a time, marking matches whose every source
  // answers empty. No match has an empty `sources` array — the dead ones list
  // sources that return 200 with [] — so asking is the only way to know.
  // Capped concurrency keeps a 300-match feed from firing 300 simultaneous
  // requests at the proxy. Matches with a fresh verdict are skipped, and a
  // dead match stays hidden while it is re-asked, so the list never jumps.
  useEffect(() => {
    const force = forceProbeRef.current;

    forceProbeRef.current = false;

    const checkedAt = Date.now();
    const queue = inScopeRef.current.filter((match) => {
      const probe = probesRef.current[matchKey(match)];

      if (!probe) return true;
      if (probe.ok) return false;

      return force || checkedAt - probe.at > EMPTY_PROBE_TTL_MS;
    });

    if (queue.length === 0) return;

    let cancelled = false;
    let cursor = 0;

    async function worker() {
      while (!cancelled && cursor < queue.length) {
        const match = queue[cursor];

        cursor += 1;

        let found = 0;

        for (const source of uniqueSources(match)) {
          try {
            const list = await fetchStreams(source);

            found += list.length;

            if (found > 0) break;
          } catch {
            // A failed probe is inconclusive; keep the match visible.
            found += 1;
            break;
          }
        }

        if (cancelled) return;

        setProbes((previous) => ({
          ...previous,
          [matchKey(match)]: { ok: found > 0, at: Date.now() },
        }));
      }
    }

    Promise.all(Array.from({ length: 6 }, worker)).catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScopeSignature, probeEpoch, fetchStreams]);

  const isDead = (match: APIMatch) => probes[matchKey(match)]?.ok === false;
  const probed = inScopeKeys.filter((key) => key in probes).length;
  const checking = hasLoaded && probed < inScopeKeys.length;

  const needle = query.trim().toLowerCase();

  const withStreams = inScope.filter((match) => !isDead(match));

  const found = needle
    ? withStreams.filter(
        (match) =>
          match.title.toLowerCase().includes(needle) ||
          match.teams?.home?.name?.toLowerCase().includes(needle) ||
          match.teams?.away?.name?.toLowerCase().includes(needle),
      )
    : withStreams;

  const liveNow = found
    .filter((match) => liveKeys.has(matchKey(match)))
    .sort((a, b) => a.date - b.date);
  const upcoming = found
    .filter((match) => !liveKeys.has(matchKey(match)))
    .sort((a, b) => a.date - b.date);
  const visibleMatches = [...liveNow, ...upcoming];

  /** Live games per scope, for the dot on each chip. Unprobed, so approximate. */
  const liveByScope = (id: string) =>
    matches.filter(
      (match) =>
        liveKeys.has(matchKey(match)) && !isDead(match) && inScopeOf(id, match),
    ).length;

  // "/" jumps to search from anywhere on the page, Escape clears it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedKey = selectedMatch ? matchKey(selectedMatch) : null;
  const selectedIsLive = selectedKey !== null && liveKeys.has(selectedKey);

  if (!apiConfigured) {
    return (
      <section className={container({ width: "wide", class: "py-24" })}>
        <div className="rounded-xl border border-dashed border-line px-8 py-16 text-center">
          <p className="eyebrow">API not configured</p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted">
            Set{" "}
            <code className="font-mono text-sm text-ink">
              SPORT_API_BASE_URL
            </code>{" "}
            in <code className="font-mono text-sm text-ink">.env.local</code> to
            the API origin, then restart the dev server.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className={container({ width: "wide", class: "pt-8 sm:pt-10" })}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className={title({ size: "sm" })}>Sport</h1>
            <span className="font-mono text-xs uppercase tracking-label text-muted">
              {!hasLoaded
                ? "Loading…"
                : checking
                  ? `Checking ${probed}/${inScopeKeys.length}`
                  : `${liveNow.length} live · ${upcoming.length} upcoming`}
            </span>
          </div>
          <button
            className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-label text-muted transition-colors hover:border-accent hover:text-accent"
            type="button"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative md:w-72 md:shrink-0">
            <input
              ref={searchRef}
              aria-label="Search games"
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-4 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
              placeholder="Search team or event…"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setQuery("");
                  event.currentTarget.blur();
                }
              }}
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[0.65rem] text-muted sm:block">
              /
            </kbd>
          </div>

          {/* Scrolls sideways on phones instead of wrapping into three rows. */}
          <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:px-0">
            {SCOPES.map((option) => {
              const live = hasLoaded ? liveByScope(option.id) : 0;
              const active = scope === option.id;

              return (
                <button
                  key={option.id}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-label transition-colors ${
                    active
                      ? "border-accent bg-accent text-paper"
                      : "border-line text-ink hover:border-accent hover:text-accent"
                  }`}
                  type="button"
                  onClick={() => changeScope(option.id)}
                >
                  {option.label}
                  {live > 0 ? (
                    <span
                      className={`rounded-full px-1.5 text-[0.6rem] ${
                        active ? "bg-paper/20" : "bg-accent/10 text-accent"
                      }`}
                      title={`${live} live`}
                    >
                      {live}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <button
              aria-label="Refresh games"
              className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              disabled={matchesLoading}
              title="Refresh"
              type="button"
              onClick={() => loadMatches({ force: true })}
            >
              <svg
                aria-hidden="true"
                className={`h-4 w-4 ${matchesLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thin progress line while the background probe is still sorting
            dead matches out, so the list shrinking does not look random. */}
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          {checking ? (
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{
                width: `${(probed / Math.max(inScopeKeys.length, 1)) * 100}%`,
              }}
            />
          ) : null}
        </div>
      </header>

      <section
        className={container({
          width: "wide",
          class: "grid gap-6 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_380px]",
        })}
      >
        {/* Player + stream picker */}
        <div ref={playerRef} className="scroll-mt-20">
          <div className="overflow-hidden rounded-xl border border-line bg-black">
            <div className="relative aspect-video">
              {activeStream ? (
                <iframe
                  // Re-mount on toggle: sandbox only takes effect at load.
                  key={`${activeStream.id}-${blockPopups}`}
                  allowFullScreen
                  // Permissions Policy is deny-by-default, so naming only what a
                  // player needs also revokes camera, mic, geolocation and the
                  // rest. It has no popup feature, hence the sandbox below.
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  className="h-full w-full"
                  // No referrerPolicy here, deliberately. The player is three
                  // iframes deep and the innermost one is referer-gated: given
                  // none it serves a stub with no player at all, which surfaces
                  // as "stream offline". Neither
                  // wrapper sends its own Referrer-Policy header, so whatever
                  // is set here is inherited all the way down and starves that
                  // check. The default (strict-origin-when-cross-origin) sends
                  // only origins, which is what the chain expects.
                  sandbox={
                    blockPopups
                      ? "allow-scripts allow-same-origin allow-presentation"
                      : undefined
                  }
                  src={activeStream.embedUrl}
                  title={selectedMatch?.title ?? "Stream"}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedMatch?.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-40"
                      src={posterUrl(selectedMatch.poster)}
                    />
                  ) : null}
                  <div className="relative flex flex-col items-center gap-3 px-6 text-center">
                    {streamsLoading ? (
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                    ) : null}
                    <p className="font-mono text-xs uppercase tracking-label text-white/70">
                      {streamsLoading
                        ? "Finding streams…"
                        : selectedMatch
                          ? streamsError || "Select a stream"
                          : "Pick a game"}
                    </p>
                    {!selectedMatch ? (
                      <p className="text-xs text-white/40">
                        <span className="lg:hidden">From the list below.</span>
                        <span className="hidden lg:inline">
                          From the list on the right. Press / to search.
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedMatch ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-ink">
                    {selectedMatch.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 font-mono text-xs uppercase tracking-label text-muted">
                    {selectedIsLive ? <LiveBadge /> : null}
                    {categoryLabel(selectedMatch.category)} ·{" "}
                    {formatKickoff(selectedMatch.date)}
                  </p>
                </div>

                {allStreams.length > 1 ? (
                  <button
                    className="shrink-0 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
                    title="Cycle through every stream on every source"
                    type="button"
                    onClick={tryNextStream}
                  >
                    Not working? Next stream →
                  </button>
                ) : null}
              </div>

              {/* Sources */}
              <div className="mt-5">
                <p className="eyebrow">Source</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {uniqueSources(selectedMatch).map((source) => {
                    const key = sourceKey(source);
                    const count = sourceStreams[key]?.length;
                    const isActive =
                      selectedSource !== null &&
                      sourceKey(selectedSource) === key;
                    const isEmpty = count === 0;

                    return (
                      <button
                        key={key}
                        aria-pressed={isActive}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-label transition-colors disabled:cursor-not-allowed ${
                          isActive
                            ? "border-accent text-accent"
                            : "border-line text-muted enabled:hover:border-accent enabled:hover:text-accent"
                        } ${isEmpty ? "opacity-40" : ""}`}
                        disabled={isEmpty || streamsLoading}
                        title={
                          isEmpty ? "No streams on this source" : undefined
                        }
                        type="button"
                        onClick={() => pickSource(source)}
                      >
                        {source.source}
                        {typeof count === "number" ? (
                          <span className="text-[0.6rem] opacity-70">
                            {count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Streams */}
              {streams.length > 0 ? (
                <div className="mt-4">
                  <p className="eyebrow">Stream</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                    {streams.map((stream, index) => {
                      const isActive = activeStream === stream;

                      return (
                        <button
                          key={`${stream.id}-${index}`}
                          aria-pressed={isActive}
                          className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                            isActive
                              ? "border-accent bg-surface"
                              : "border-line hover:border-accent"
                          }`}
                          type="button"
                          onClick={() => setActiveStream(stream)}
                        >
                          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-label text-ink">
                            #{stream.streamNo}
                            {stream.hd ? (
                              <span className="rounded border border-line px-1 text-[0.6rem] text-muted">
                                HD
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {stream.language || "Unknown"}
                            {typeof stream.viewers === "number"
                              ? ` · ${compactNumber.format(stream.viewers)} watching`
                              : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <details className="group mt-6 border-t border-line pt-4">
                <summary className="flex cursor-pointer list-none items-center gap-3 font-mono text-xs uppercase tracking-label text-muted [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-90"
                  >
                    ›
                  </span>
                  Player settings
                  <span className={blockPopups ? "text-accent" : ""}>
                    · popups {blockPopups ? "blocked" : "allowed"}
                  </span>
                </summary>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    aria-checked={blockPopups}
                    className="flex items-center gap-3"
                    role="switch"
                    type="button"
                    onClick={togglePopupBlocking}
                  >
                    <span
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        blockPopups ? "bg-accent" : "bg-line"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform ${
                          blockPopups
                            ? "translate-x-[1.125rem]"
                            : "translate-x-0.5"
                        }`}
                      />
                    </span>
                    <span className="text-sm text-ink">Block popups</span>
                  </button>
                  <p className="max-w-md text-xs leading-relaxed text-muted">
                    {blockPopups
                      ? "Sandboxed, so the embed cannot open popunders — but this provider detects the sandbox and may refuse to play."
                      : "The embed can open popunder ads. An ad blocker stops them without tripping the provider's sandbox check."}
                  </p>
                </div>
              </details>
            </div>
          ) : null}
        </div>

        {/* Match list. Sticky beside the player on desktop so picking another
            game never scrolls the player away. */}
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {matchesError ? (
            <div className="mb-4 rounded-lg border border-accent/40 bg-surface p-4">
              <p className="font-mono text-xs uppercase tracking-label text-accent">
                API error
              </p>
              <p className="mt-2 text-sm text-muted">{matchesError}</p>
              <button
                className="mt-3 font-mono text-xs uppercase tracking-label text-ink underline-offset-4 hover:text-accent hover:underline"
                type="button"
                onClick={() => loadMatches({ force: true })}
              >
                Try again
              </button>
            </div>
          ) : null}

          {!hasLoaded ? <MatchListSkeleton /> : null}

          {hasLoaded &&
          !matchesError &&
          !checking &&
          visibleMatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-6 text-center">
              <p className="text-sm text-muted">
                {needle
                  ? `Nothing matching “${query.trim()}”.`
                  : inScope.length > 0
                    ? "Nothing with a working stream here right now."
                    : "No games in this scope today."}
              </p>
              {needle ? (
                <button
                  className="mt-3 font-mono text-xs uppercase tracking-label text-ink hover:text-accent"
                  type="button"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </button>
              ) : scope !== "all" ? (
                <button
                  className="mt-3 font-mono text-xs uppercase tracking-label text-ink hover:text-accent"
                  type="button"
                  onClick={() => changeScope("all")}
                >
                  Show everything
                </button>
              ) : null}
            </div>
          ) : null}

          {[
            { heading: "Live now", items: liveNow },
            { heading: "Later today", items: upcoming },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.heading} className="mb-6">
                <h2 className="sticky top-0 z-10 mb-2 bg-paper py-1 font-mono text-xs uppercase tracking-label text-accent">
                  {group.heading}
                  <span className="ml-2 text-muted">{group.items.length}</span>
                </h2>

                <ul className="space-y-2">
                  {group.items.map((match, index) => (
                    <li key={`${matchKey(match)}-${index}`}>
                      <MatchRow
                        isLive={liveKeys.has(matchKey(match))}
                        isSelected={selectedKey === matchKey(match)}
                        match={match}
                        now={now}
                        onSelect={() => selectMatch(match)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </aside>
      </section>
    </>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-paper">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-paper opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-paper" />
      </span>
      Live
    </span>
  );
}

function TeamBadge({ badge }: { badge?: string }) {
  if (!badge) {
    return <span className="h-5 w-5 shrink-0 rounded-full bg-line" />;
  }

  return (
    // Plain <img>: same-origin proxy URLs that need the session cookie, which
    // next/image would not send.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      className="h-5 w-5 shrink-0 object-contain"
      height={20}
      loading="lazy"
      src={badgeUrl(badge)}
      width={20}
    />
  );
}

function MatchRow({
  match,
  isLive,
  isSelected,
  now,
  onSelect,
}: {
  match: APIMatch;
  isLive: boolean;
  isSelected: boolean;
  now: number;
  onSelect: () => void;
}) {
  const home = match.teams?.home;
  const away = match.teams?.away;
  const countdown = isLive ? null : formatCountdown(match.date, now);

  return (
    <button
      aria-current={isSelected ? "true" : undefined}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? "border-accent bg-surface"
          : "border-line hover:border-accent/60 hover:bg-surface"
      }`}
      type="button"
      onClick={onSelect}
    >
      <span className="min-w-0 flex-1">
        {home?.name && away?.name ? (
          // Two teams: one per line with badges, the way a scoreboard reads.
          <span className="block space-y-1">
            {[home, away].map((team, index) => (
              <span
                key={index}
                className="flex items-center gap-2 text-sm font-medium text-ink"
              >
                <TeamBadge badge={team.badge} />
                <span className="truncate">{team.name}</span>
              </span>
            ))}
          </span>
        ) : (
          <span className="block truncate text-sm font-medium text-ink">
            {match.title}
          </span>
        )}
        <span className="mt-1.5 block font-mono text-[0.65rem] uppercase tracking-label text-muted">
          {categoryLabel(match.category)}
          {match.popular ? " · Popular" : ""}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1 text-right">
        {isLive ? (
          <LiveBadge />
        ) : (
          <>
            <span className="font-mono text-xs text-ink">
              {formatTime(match.date)}
            </span>
            {countdown ? (
              <span className="font-mono text-[0.6rem] uppercase tracking-label text-accent">
                {countdown}
              </span>
            ) : null}
          </>
        )}
      </span>
    </button>
  );
}

function MatchListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading games" className="space-y-2">
      <div className="mb-3 h-3 w-24 animate-pulse rounded bg-line" />
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-line p-3"
        >
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-line" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line" />
          </div>
          <div className="h-3 w-10 animate-pulse rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
