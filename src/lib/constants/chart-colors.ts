// Chart colors for Recharts. Colors land on SVG stroke/fill attributes,
// which accept CSS var() — so chart accents follow the day theme.
export const CHART_COLORS = {
  success: "var(--primary)",
  info: "var(--primary)",
  warning: "#d97706",
  grid: "#d1d5db",
  gridDark: "#374151",
} as const;
