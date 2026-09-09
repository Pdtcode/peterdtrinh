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
  const [matchesError, setMatchesError] = useState("");

  const [selectedMatch, setSelectedMatch] = useState<APIMatch | null>(null);
  const [selectedSource, setSelectedSource] = useState<APIMatchSource | null>(
    null,
  );

  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);
  const [streamsError, setStreamsError] = useState("");
  const [activeStream, setActiveStream] = useState<Stream | null>(null);

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
      setBlockPopups(localStorage.getItem("sport.blockPopups") === "1");
    } catch {
      // Private windows and blocked site data throw here; the default is fine.
    }
  }, []);

  function togglePopupBlocking() {
    setBlockPopups((previous) => {
      const next = !previous;

      try {
        localStorage.setItem("sport.blockPopups", next ? "1" : "0");
      } catch {
        // Preference just will not persist; not worth surfacing.
      }

      return next;
    });
  }

  async function signOut() {
    await fetch("/api/sport/logout", { method: "POST" });
    window.location.href = "/";
  }

  const loadMatches = useCallback(async () => {
    if (!apiConfigured) return;

    setMatchesLoading(true);
    setMatchesError("");

    try {
      // Both feeds every time: "live" says what is on right now, "all-today"
      // gives the day's schedule. Merging them means live games can be pinned
      // in place rather than hidden behind a separate tab.
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
      setMatchesLoading(false);
    }
  }, [apiConfigured]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

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

  /**
   * Matches whose every source answered with an empty list. No match in the
   * feed has a genuinely empty `sources` array — the dead ones list sources
   * that return 200 with `[]` — so the only way to spot them is to ask, which
   * this does in the background rather than blocking the list on it.
   */
  const [emptyMatches, setEmptyMatches] = useState<Set<string>>(new Set());
  const [probed, setProbed] = useState(0);
  const probeRef = useRef(0);

  /** Cache of every source's streams for the selected match, keyed source-id. */
  const [sourceStreams, setSourceStreams] = useState<Record<string, Stream[]>>(
    {},
  );

  const sourceKey = (source: APIMatchSource) => `${source.source}-${source.id}`;

  /** Switching sources reads the cache filled by selectMatch — no refetch. */
  function pickSource(source: APIMatchSource) {
    const list = sourceStreams[sourceKey(source)] ?? [];

    setSelectedSource(source);
    setStreams(list);
    setActiveStream(list[0] ?? null);
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

  // Walks the current feed a few matches at a time, marking the ones with no
  // streams anywhere. Capped concurrency keeps a 300-match feed from firing
  // 300 simultaneous requests at the proxy.
  // Everything the current scope covers, before the search box narrows it.
  const inScope = matches.filter((match) => {
    if (scope === "all") return true;
    if (scope === "mine") {
      return FAVORITE_SPORTS.includes(
        match.category as (typeof FAVORITE_SPORTS)[number],
      );
    }

    return match.category === scope;
  });

  // inScope is a fresh array every render, so the probe keys off a stable
  // signature of it and reads the latest value through a ref.
  const inScopeKeys = inScope.map(matchKey);
  const inScopeSignature = inScopeKeys.join("|");
  const inScopeRef = useRef(inScope);

  inScopeRef.current = inScope;

  // Probes the scoped list a few at a time, marking matches whose every source
  // answers empty. No match has an empty `sources` array — the dead ones list
  // sources that return 200 with [] — so asking is the only way to know.
  useEffect(() => {
    if (inScopeRef.current.length === 0) return;

    const token = (probeRef.current += 1);
    let cancelled = false;
    let cursor = 0;

    setEmptyMatches(new Set());
    setProbed(0);

    const queue = inScopeRef.current.slice();

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

        if (cancelled || token !== probeRef.current) return;

        if (found === 0) {
          setEmptyMatches((previous) => {
            const next = new Set(previous);

            next.add(matchKey(match));

            return next;
          });
        }

        setProbed((count) => count + 1);
      }
    }

    Promise.all(Array.from({ length: 6 }, worker)).catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScopeSignature, fetchStreams]);

  const needle = query.trim().toLowerCase();

  const withStreams = inScope.filter(
    (match) => !emptyMatches.has(matchKey(match)),
  );

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
      <header className={container({ width: "wide", class: "pt-14 sm:pt-16" })}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Private</p>
            <h1 className={title({ size: "md", class: "mt-3" })}>Sport</h1>
          </div>
          <button
            className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
            type="button"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        <div className="mt-8">
          <input
            aria-label="Search games"
            className="w-full max-w-md rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
            placeholder="Search team or event…"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SCOPES.map((option) => (
            <button
              key={option.id}
              className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-label transition-colors ${
                scope === option.id
                  ? "border-accent bg-accent text-paper"
                  : "border-line text-ink hover:border-accent hover:text-accent"
              }`}
              type="button"
              onClick={() => setScope(option.id)}
            >
              {option.label}
            </button>
          ))}

          <button
            className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-label text-muted transition-colors hover:border-accent hover:text-accent"
            disabled={matchesLoading}
            type="button"
            onClick={loadMatches}
          >
            {matchesLoading ? "Loading…" : "Refresh"}
          </button>

          <span className="font-mono text-xs uppercase tracking-label text-muted">
            {matchesLoading
              ? ""
              : probed < inScopeKeys.length
                ? `checking ${probed}/${inScopeKeys.length}`
                : `${liveNow.length} live · ${upcoming.length} upcoming`}
          </span>
        </div>

        {matchesError ? (
          <div className="mt-5 rounded-lg border border-accent/40 bg-surface p-4">
            <p className="font-mono text-xs uppercase tracking-label text-accent">
              API error
            </p>
            <p className="mt-2 text-sm text-muted">{matchesError}</p>
          </div>
        ) : null}
      </header>

      <section
        className={container({
          width: "wide",
          class: "grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]",
        })}
      >
        {/* Player + stream picker */}
        <div>
          <div className="overflow-hidden rounded-xl border border-line bg-black">
            <div className="aspect-video">
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
                <div className="relative flex h-full items-center justify-center">
                  {selectedMatch?.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-40"
                      src={posterUrl(selectedMatch.poster)}
                    />
                  ) : null}
                  <p className="relative font-mono text-xs uppercase tracking-label text-white/60">
                    {selectedMatch ? "Select a stream" : "Select a match"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedMatch ? (
            <div className="mt-5">
              <h2 className="text-lg font-semibold text-ink">
                {selectedMatch.title}
              </h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-label text-muted">
                {selectedMatch.category} · {formatKickoff(selectedMatch.date)}
              </p>

              {/* Sources */}
              <div className="mt-5 flex flex-wrap gap-2">
                {uniqueSources(selectedMatch).map((source) => {
                  const key = sourceKey(source);
                  const count = sourceStreams[key]?.length;
                  const isActive =
                    selectedSource?.source === source.source &&
                    selectedSource?.id === source.id;
                  const isEmpty = count === 0;

                  return (
                    <button
                      key={key}
                      className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-label transition-colors ${
                        isActive
                          ? "border-accent text-accent"
                          : "border-line text-muted hover:border-accent hover:text-accent"
                      } ${isEmpty ? "opacity-40" : ""}`}
                      type="button"
                      onClick={() => pickSource(source)}
                    >
                      {source.source}
                      {typeof count === "number" ? ` ${count}` : ""}
                    </button>
                  );
                })}
              </div>

              {/* Streams */}
              <div className="mt-4 flex flex-wrap gap-2">
                {streamsLoading ? (
                  <p className="text-sm text-muted">Loading streams…</p>
                ) : null}

                {streams.map((stream, index) => (
                  <button
                    key={`${stream.id}-${index}`}
                    className={`rounded-lg border px-4 py-2 text-left transition-colors ${
                      activeStream?.id === stream.id
                        ? "border-accent"
                        : "border-line hover:border-accent"
                    }`}
                    type="button"
                    onClick={() => setActiveStream(stream)}
                  >
                    <span className="block font-mono text-xs uppercase tracking-label text-ink">
                      #{stream.streamNo} {stream.hd ? "· HD" : ""}
                    </span>
                    <span className="block text-xs text-muted">
                      {stream.language}
                      {typeof stream.viewers === "number"
                        ? ` · ${stream.viewers} watching`
                        : ""}
                    </span>
                  </button>
                ))}
              </div>

              {streamsError ? (
                <p className="mt-3 text-sm text-muted">{streamsError}</p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <button
                  aria-pressed={blockPopups}
                  className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-label transition-colors ${
                    blockPopups
                      ? "border-accent bg-accent text-paper"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}
                  type="button"
                  onClick={togglePopupBlocking}
                >
                  {blockPopups ? "Popups blocked" : "Popups allowed"}
                </button>
                <p className="max-w-md text-xs leading-relaxed text-muted">
                  {blockPopups
                    ? "Sandboxed, so the embed cannot open popunders — but this provider detects the sandbox and may refuse to play."
                    : "The embed can open popunder ads. An ad blocker stops them without tripping the provider's sandbox check."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Match list */}
        <aside className="lg:max-h-[75vh] lg:overflow-y-auto">
          {matchesError ? (
            <p className="rounded-lg border border-line p-4 text-sm text-muted">
              {matchesError}
            </p>
          ) : null}

          {!matchesLoading && visibleMatches.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
              {needle
                ? `Nothing matching “${query.trim()}”.`
                : inScope.length > 0
                  ? "Nothing with a working stream here right now."
                  : "No games in this scope today."}
            </p>
          ) : null}

          {[
            { heading: "Live now", items: liveNow },
            { heading: "Later today", items: upcoming },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.heading} className="mb-6">
                <h2 className="mb-2 font-mono text-xs uppercase tracking-label text-accent">
                  {group.heading}
                  <span className="ml-2 text-muted">{group.items.length}</span>
                </h2>

                <ul className="space-y-2">
                  {group.items.map((match, index) => {
                    const isLive = liveKeys.has(matchKey(match));

                    return (
                      <li key={`${matchKey(match)}-${index}`}>
                        <button
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                            selectedMatch?.id === match.id
                              ? "border-accent bg-surface"
                              : "border-line hover:border-accent"
                          }`}
                          type="button"
                          onClick={() => selectMatch(match)}
                        >
                          {/* Plain <img>: same-origin proxy URLs that need the
                              session cookie, which next/image would not send. */}
                          {match.teams?.home?.badge ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              className="h-7 w-7 shrink-0 object-contain"
                              height={28}
                              loading="lazy"
                              src={badgeUrl(match.teams.home.badge)}
                              width={28}
                            />
                          ) : null}
                          {match.teams?.away?.badge ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              className="h-7 w-7 shrink-0 object-contain"
                              height={28}
                              loading="lazy"
                              src={badgeUrl(match.teams.away.badge)}
                              width={28}
                            />
                          ) : null}

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">
                              {match.title}
                            </span>
                            <span className="block font-mono text-[0.65rem] uppercase tracking-label text-muted">
                              {isLive
                                ? "live · "
                                : `${formatTime(match.date)} · `}
                              {match.category}
                            </span>
                          </span>

                          {isLive ? (
                            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-paper">
                              Live
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </aside>
      </section>
    </>
  );
}
