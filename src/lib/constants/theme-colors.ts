export const THEME_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "pull-back":        { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500", border: "border-l-violet-500" },
  "pull-rear":        { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500", border: "border-l-purple-500" },
  "push-chest":       { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", border: "border-l-blue-500" },
  "push-shoulder":    { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500", border: "border-l-sky-500" },
  "legs-foundation":  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", border: "border-l-amber-500" },
  "legs-hypertrophy": { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", border: "border-l-orange-500" },
  "recovery":         { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-l-emerald-500" },
  "rest":             { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400", border: "border-l-slate-400" },
};

const DEFAULT_THEME = { bg: "bg-muted/60", text: "text-muted-foreground", dot: "bg-muted-foreground", border: "border-l-muted-foreground" };

export function getThemeColor(dayTheme: string) {
  return THEME_COLORS[dayTheme] ?? DEFAULT_THEME;
}

export function getThemeLabel(dayTheme: string): string {
  const labels: Record<string, string> = {
    "pull-back": "Pull · Back",
    "pull-rear": "Pull · Rear Delts",
    "push-chest": "Push · Chest",
    "push-shoulder": "Push · Shoulders",
    "legs-foundation": "Legs · Foundation",
    "legs-hypertrophy": "Legs · Hypertrophy",
    "recovery": "Active Recovery",
    "rest": "Rest Day",
  };
  return labels[dayTheme] ?? dayTheme;
}
