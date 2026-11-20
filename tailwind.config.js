const { fontFamily } = require("tailwindcss/defaultTheme");

/** Design tokens live here and in src/styles/global.css (CSS variables). */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        signal: "rgb(var(--c-signal) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Archivo", "Arial Narrow", ...fontFamily.sans],
        sans: ["Geist", "Inter", ...fontFamily.sans],
        mono: ["'Geist Mono'", "ui-monospace", ...fontFamily.mono],
      },
      fontSize: {
        // Minimum sizes for mono UI text; nothing on screen goes below `label`.
        label: ["0.75rem", { lineHeight: "1.1rem", letterSpacing: "0.04em" }],
        meta: ["0.8125rem", { lineHeight: "1.25rem" }],
        small: ["0.875rem", { lineHeight: "1.35rem" }],
        eyebrow: ["0.8125rem", { lineHeight: "1.1rem", letterSpacing: "0.08em" }],
      },
      maxWidth: {
        site: "78rem",
        prose: "40rem",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
