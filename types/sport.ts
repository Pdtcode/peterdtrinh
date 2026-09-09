/**
 * Shapes returned by the upstream sports API.
 *
 * Kept free of server imports so the /sport console can use them on the client
 * without dragging `next/server` into the browser bundle.
 */

export interface APIMatchTeam {
  name: string;
  /** Badge ID, resolved through /api/sport/images/badge/<id>.webp */
  badge: string;
}

export interface APIMatchSource {
  /** Stream source identifier, e.g. "alpha". */
  source: string;
  /** Source-specific match ID, passed to the streams endpoint. */
  id: string;
}

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  /** Unix timestamp in milliseconds. */
  date: number;
  poster?: string;
  popular: boolean;
  teams?: {
    home?: APIMatchTeam;
    away?: APIMatchTeam;
  };
  sources: APIMatchSource[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  /** Upstream URL for the iframe. See the note in app/sport/console.tsx. */
  embedUrl: string;
  source: string;
  /** Present on the live API though absent from the docs. */
  viewers?: number;
}

export interface Sport {
  id: string;
  name: string;
}
