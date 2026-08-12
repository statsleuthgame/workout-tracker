export const THEME_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "upper-push":         { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", border: "border-l-blue-500" },
  "upper-pull":         { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500", border: "border-l-violet-500" },
  "upper-sculpt":       { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500", border: "border-l-sky-500" },
  "lower-ham-glute":    { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", border: "border-l-orange-500" },
  "lower-quad":         { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", border: "border-l-amber-500" },
  "lower-glute-volume": { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", border: "border-l-rose-500" },
  "recovery":           { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-l-emerald-500" },
  "rest":               { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400", border: "border-l-slate-400" },
};

// Browser-chrome color (PWA status bar / <meta name="theme-color">) per day theme.
export const THEME_META_COLORS: Record<string, string> = {
  "upper-push": "#2563eb",
  "upper-pull": "#7c3aed",
  "upper-sculpt": "#0284c7",
  "lower-ham-glute": "#ea580c",
  "lower-quad": "#d97706",
  "lower-glute-volume": "#e11d48",
  "recovery": "#166534",
  "rest": "#166534",
};

const DEFAULT_THEME = { bg: "bg-muted/60", text: "text-muted-foreground", dot: "bg-muted-foreground", border: "border-l-muted-foreground" };

export function getThemeColor(dayTheme: string) {
  return THEME_COLORS[dayTheme] ?? DEFAULT_THEME;
}

export function getThemeLabel(dayTheme: string): string {
  const labels: Record<string, string> = {
    "upper-push": "Upper · Push",
    "upper-pull": "Upper · Pull",
    "upper-sculpt": "Upper · Sculpt & Core",
    "lower-ham-glute": "Lower · Hams & Glutes",
    "lower-quad": "Lower · Quads & Calves",
    "lower-glute-volume": "Lower · Glute Volume",
    "recovery": "Active Recovery",
    "rest": "Rest Day",
  };
  return labels[dayTheme] ?? dayTheme;
}
