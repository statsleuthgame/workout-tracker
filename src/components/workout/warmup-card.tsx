"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { WarmupItem } from "@/lib/db/database";
import { ChevronDown, Flame } from "lucide-react";

interface WarmupCardProps {
  title: string;
  items: WarmupItem[];
}

// Informational warm-up checklist — not tracked or logged, just a reminder
// to move through the dynamic routine before the working sets.
export function WarmupCard({ title, items }: WarmupCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-l-[3px] border-l-emerald-500 transition-all duration-300">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={title}
        className="flex w-full items-center justify-between gap-2 pl-5 pr-4 py-3.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Flame className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-bold text-sm truncate">{title}</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Dynamic — get blood flowing before you lift
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <CardContent className="pl-5 pr-4 pb-4 pt-0 animate-slide-up">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.name} className="flex gap-2.5 text-sm">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
