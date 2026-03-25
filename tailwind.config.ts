import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          card: "var(--bg-card)",
          "card-hover": "var(--bg-card-hover)",
          surface: "var(--bg-surface)",
        },
        border: {
          DEFAULT: "var(--border-color)",
          hover: "var(--border-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          cyan: "var(--accent-cyan)",
          "cyan-dim": "var(--accent-cyan-dim)",
          emerald: "var(--accent-emerald)",
          rose: "var(--accent-rose)",
          amber: "var(--accent-amber)",
          violet: "var(--accent-violet)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        container: "1200px",
      },
      borderRadius: {
        card: "16px",
        pill: "99px",
      },
    },
  },
  plugins: [],
};
export default config;
