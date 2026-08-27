/**
 * Creative work: photography and video.
 *
 * HOW TO ADD YOUR WORK
 * 1. Drop image files into `public/creative/` (e.g. public/creative/okc-01.jpg).
 *    Export them at ~2000px on the long edge and compress before committing.
 * 2. Add an entry below. `src` is the path under /public, so
 *    public/creative/okc-01.jpg becomes "/creative/okc-01.jpg".
 * 3. For video, `embed` takes a YouTube or Vimeo *embed* URL, e.g.
 *    "https://www.youtube.com/embed/VIDEO_ID" or
 *    "https://player.vimeo.com/video/VIDEO_ID".
 *
 * Both arrays are intentionally empty, so the page renders an honest
 * "work coming soon" state until you fill them in.
 */

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  /** Controls grid footprint. "tall" and "wide" break up the rhythm. */
  span?: "normal" | "tall" | "wide";
}

export interface Video {
  title: string;
  /** YouTube/Vimeo embed URL. */
  embed: string;
  description?: string;
  /** Poster image under /public, shown before the iframe loads. */
  poster?: string;
}

export const photos: Photo[] = [
  // {
  //   src: "/creative/okc-01.jpg",
  //   alt: "Downtown Oklahoma City at dusk",
  //   caption: "Downtown OKC, 2025",
  //   span: "tall",
  // },
];

export const videos: Video[] = [
  // {
  //   title: "Han Jan: Pocha Nights",
  //   embed: "https://www.youtube.com/embed/VIDEO_ID",
  //   description: "A short spot cut for Han Jan Korean Kitchen & Pocha.",
  // },
];

/** Services listed on the Creative page. These are real offerings, not samples. */
export const services = [
  {
    heading: "Commercial",
    body: "Product, food, and interior photography for businesses that need their own images instead of stock.",
  },
  {
    heading: "Events",
    body: "Candid and posed coverage for openings, gatherings, and private events around Oklahoma City.",
  },
  {
    heading: "Portraits",
    body: "Individual and team portraits, on location or in a simple studio setup.",
  },
  {
    heading: "Video",
    body: "Short-form brand spots and highlight reels, shot and edited end to end.",
  },
];
