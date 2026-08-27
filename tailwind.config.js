import { heroui } from "@heroui/theme";

/**
 * Design language: "ink on paper".
 * Warm off-white light mode, near-black dark mode, one crimson accent
 * (OU Crimson #841617, lightened to #E3474A in dark mode for contrast).
 * Mono is used for labels/metadata, sans for body, Protest Revolution for the wordmark.
 */
const palette = {
  light: {
    paper: "#FAF9F6",
    surface: "#FFFFFF",
    ink: "#12100E",
    muted: "#6B6560",
    line: "#E5E1DA",
    accent: "#841617",
  },
  dark: {
    paper: "#0C0B0A",
    surface: "#151312",
    ink: "#F5F2EC",
    muted: "#948C83",
    line: "#262321",
    accent: "#E3474A",
  },
};

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-protest-revolution)"],
        // kept for backwards compatibility with existing markup
        "protest-revolution": ["var(--font-protest-revolution)"],
      },
      colors: {
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
      },
      letterSpacing: {
        label: "0.16em",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: palette.light.paper,
            foreground: palette.light.ink,
            focus: palette.light.accent,
            divider: palette.light.line,
            primary: {
              DEFAULT: palette.light.accent,
              foreground: "#FFFFFF",
            },
          },
        },
        dark: {
          colors: {
            background: palette.dark.paper,
            foreground: palette.dark.ink,
            focus: palette.dark.accent,
            divider: palette.dark.line,
            primary: {
              DEFAULT: palette.dark.accent,
              foreground: "#14090A",
            },
          },
        },
      },
    }),
  ],
};

module.exports = config;
