export type SiteConfig = typeof siteConfig;

/**
 * Feature flags.
 *
 * `creative`: flip to true once there is photo/video work in
 * config/creative.ts. That restores the nav and footer links, the home page
 * and about page mentions, the sitemap entry, and the /creative route itself.
 * While false the route returns a 404 rather than an empty portfolio.
 *
 * `writing`: flip to true once there are posts in Sanity. That restores the
 * nav and footer links, the home page "Recent writing" section, the stream
 * page link, and the sitemap entries. The /blog route and the RSS feed stay
 * live either way, so existing post URLs and subscribers never break.
 */
export const features = {
  creative: false,
  writing: false,
};

export const siteConfig = {
  name: "Peter Đ. Trinh",
  shortName: "Peter Trinh",
  url: "https://peterdtrinh.com",
  description:
    "Analyst and full-stack developer in Oklahoma City. I turn business requirements into production software using Next.js, React, TypeScript, and PostgreSQL.",
  tagline: "Do Everything",
  role: "Analyst & Full-Stack Developer",
  location: "Oklahoma City, OK",
  email: "trinhpeter15@gmail.com",

  // Primary nav leads with the software/analyst path. Creative and Live are
  // still live pages, they just sit in the menu and footer instead.
  navItems: [
    { label: "Work", href: "/projects" },
    { label: "Resume", href: "/resume" },
    ...(features.writing ? [{ label: "Writing", href: "/blog" }] : []),
    { label: "About", href: "/about" },
  ],

  navMenuItems: [
    { label: "Work", href: "/projects" },
    { label: "Resume", href: "/resume" },
    ...(features.writing ? [{ label: "Writing", href: "/blog" }] : []),
    { label: "About", href: "/about" },
    ...(features.creative ? [{ label: "Creative", href: "/creative" }] : []),
    { label: "Live", href: "/stream" },
  ],

  links: {
    linkedin: "https://www.linkedin.com/in/peter-trinh-1b9108199",
    instagram: "https://www.instagram.com/peda.trinh/",
    discord: "",
    sponsor: "https://account.venmo.com/u/Peter-Trinh-7",
  },

  // Live streaming. Both channels are linked; `primary` picks which one gets
  // the embedded player on /stream. YouTube can only be embedded with a
  // UC... channel ID (a handle will not work), so it stays link-only until
  // `youtube.channelId` is filled in.
  stream: {
    primary: "twitch" as "twitch" | "youtube",
    twitch: {
      // Channel login name.
      channel: "ppp16",
    },
    youtube: {
      // Public handle, without the leading "@". Used for the profile link.
      handle: "ppp16_stream",
      // Channel ID (UC...), required for the embedded player. Find it under
      // Settings → Advanced settings at youtube.com/account_advanced.
      channelId: "",
    },
  },
};
