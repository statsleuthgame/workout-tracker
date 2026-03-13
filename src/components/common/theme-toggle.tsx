"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/hooks/use-theme";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "dark" ? "Dark mode" : theme === "light" ? "Light mode" : "System theme";

  return (
    <button
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl glass-card text-muted-foreground transition-all hover:text-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
