"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useTemplatesForWeek,
  useProgram,
  useCompletedWorkoutsForWeek,
} from "@/lib/db/hooks";
import {
  getWeekNumber,
  getDayAbbrev,
  getDateForDayInWeek,
} from "@/lib/utils/dates";
import { PageHeader } from "@/components/common/page-header";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WeekPage() {
  const currentWeek = getWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const program = useProgram();
  const templates = useTemplatesForWeek(selectedWeek);
  const completedWorkouts = useCompletedWorkoutsForWeek(selectedWeek);

  if (!program) {
    return (
      <div className="space-y-4 px-4 pt-6">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 flex-1 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const completedTemplateIds = new Set(
    completedWorkouts?.map((w) => w.templateId) || []
  );

  return (
    <div className="space-y-4 px-4 pt-6">
      <PageHeader title={program.name} subtitle={program.phase} />

      {/* Week Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              selectedWeek === week
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Week {week}
          </button>
        ))}
      </div>

      {/* Day Cards */}
      <div className="space-y-2">
        {templates?.map((template) => {
          const date = getDateForDayInWeek(selectedWeek, template.dayOfWeek);
          const dayNum = date.getDate();
          const isCompleted = completedTemplateIds.has(template.id);
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <Link
              key={template.id}
              href={`/today?week=${selectedWeek}&day=${template.dayOfWeek}`}
            >
              <Card
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 ${
                  isToday ? "border-primary" : ""
                } ${isCompleted ? "bg-success-muted/50" : ""}`}
              >
                <div
                  className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <span className="text-[10px] font-bold leading-none">
                    {getDayAbbrev(template.dayOfWeek)}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {dayNum}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                      {template.dayLabel}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.exercises.length} Exercises
                  </p>
                </div>

                {isCompleted && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-muted">
                    <Check className="h-5 w-5 text-success" aria-hidden="true" />
                  </div>
                )}

                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
