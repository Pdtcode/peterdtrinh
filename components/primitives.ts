import { tv } from "tailwind-variants";

/** Page/section headings. Tight, large, ink-colored by default. */
export const title = tv({
  base: "font-semibold tracking-tight text-balance text-ink",
  variants: {
    size: {
      sm: "text-2xl sm:text-3xl",
      md: "text-3xl sm:text-4xl lg:text-5xl",
      lg: "text-4xl sm:text-5xl lg:text-6xl",
      xl: "text-5xl sm:text-6xl lg:text-7xl leading-[0.95]",
    },
    color: {
      ink: "text-ink",
      accent: "text-accent",
      muted: "text-muted",
    },
    display: {
      true: "font-display font-normal",
    },
  },
  defaultVariants: {
    size: "md",
    color: "ink",
  },
});

/** Supporting copy beneath a title. */
export const subtitle = tv({
  base: "text-lg leading-relaxed text-muted text-pretty",
  variants: {
    size: {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl sm:text-2xl",
    },
    width: {
      prose: "max-w-prose",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "md",
    width: "prose",
  },
});

/** Consistent page gutter + max width. Every route uses this. */
export const container = tv({
  base: "mx-auto w-full px-6 sm:px-8",
  variants: {
    width: {
      narrow: "max-w-3xl",
      default: "max-w-5xl",
      wide: "max-w-7xl",
    },
  },
  defaultVariants: {
    width: "default",
  },
});

/** Vertical rhythm for a top-level page section. */
export const section = tv({
  base: "py-14 sm:py-20",
  variants: {
    size: {
      sm: "py-10 sm:py-14",
      md: "py-14 sm:py-20",
      lg: "py-20 sm:py-28",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** Bordered surface used for cards across Work / Creative / Writing. */
export const card = tv({
  base: "group relative overflow-hidden rounded-xl border border-line bg-surface transition-colors duration-300",
  variants: {
    interactive: {
      true: "hover:border-accent/50",
    },
  },
});

/** Small metadata pill (tech tags, categories). */
export const tag = tv({
  base: "inline-flex items-center rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-label text-muted",
});
