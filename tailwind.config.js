/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        "paper-dim": "var(--color-paper-dim)",
        line: "var(--color-line)",
        slate: "var(--color-slate)",
        "slate-light": "var(--color-slate-light)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        good: "var(--color-good)",
        "good-soft": "var(--color-good-soft)",
        bad: "var(--color-bad)",
        "bad-soft": "var(--color-bad-soft)",
      },
      fontFamily: {
        display: ["General Sans", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
