/**
 * Static design tokens for the admin shell itself (sidebar, cards, charts).
 * The editable brand colors (primary/secondary/tertiary shown to visitors
 * on the public site) live in AppearanceSettings and are applied at runtime
 * — see theme-runtime.ts.
 */

export const colors = {
  paper: "#F5F7FB",
  surface: "#FFFFFF",
  ink: "#0E1220",
  inkSoft: "#4B5163",
  inkMuted: "#7B8194",
  line: "#E3E6EF",
  brand: {
    500: "#3B4C8C",
    600: "#2B3A6C",
    700: "#202C52",
  },
  coral: {
    500: "#FF6B4A",
    600: "#E24F30",
  },
  teal: {
    500: "#14A87C",
    600: "#0F8763",
  },
} as const;

export const DEFAULT_APPEARANCE = {
  primaryColor: "#2B3A6C",
  secondaryColor: "#FF6B4A",
  tertiaryColor: "#14A87C",
};

export const CHART_PALETTE = [colors.brand[500], colors.coral[500], colors.teal[500], "#8695C9", "#FFB69A"];
