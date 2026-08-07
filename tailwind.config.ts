import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F7FB",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#0E1220",
          soft: "#4B5163",
          muted: "#7B8194",
        },
        line: "#E3E6EF",
        // Admin chrome palette (sidebar / shell) — independent from the
        // editable brand colors, which live in src/lib/theme.ts and are
        // applied as CSS variables so they can change at runtime.
        slate: {
          950: "#0B0E17",
          925: "#0F1320",
          900: "#12162590",
        },
        brand: {
          50: "#EEF1F8",
          100: "#D6DCEE",
          200: "#AEB9DD",
          300: "#8695C9",
          400: "#5C6DAE",
          500: "#3B4C8C",
          600: "#2B3A6C",
          700: "#202C52",
          800: "#161E3A",
          900: "#0D1226",
        },
        coral: {
          50: "#FFF1EC",
          100: "#FFDCCE",
          200: "#FFB69A",
          300: "#FF9068",
          400: "#FF7A50",
          500: "#FF6B4A",
          600: "#E24F30",
          700: "#B93D24",
          800: "#8A2D1A",
          900: "#5C1E11",
        },
        teal: {
          50: "#E9FBF5",
          100: "#C6F3E3",
          200: "#8FE4C8",
          300: "#54D2AA",
          400: "#22BE8F",
          500: "#14A87C",
          600: "#0F8763",
          700: "#0B664C",
          800: "#084936",
          900: "#052E22",
        },
        // Live-editable company brand colors, driven by CSS variables set
        // from Appearance settings (see src/lib/theme-runtime.ts).
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        "8xl": "90rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,18,32,0.04), 0 8px 24px -12px rgba(14,18,32,0.12)",
        lift: "0 20px 40px -20px rgba(14,18,32,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
