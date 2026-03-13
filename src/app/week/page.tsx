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
import { StatCard } from "@/components/common/stat-card";
import { getThemeColor, getThemeLabel } from "@/lib/constants/theme-colors";
import { Check, ChevronRight, Coffee, Dumbbell } from "lucide-react";
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
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const completedTemplateIds = new Set(
    completedWorkouts?.map((w) => w.templateId) || []
  );

  const workoutTemplates = templates?.filter((t) => t.dayTheme !== "rest");
  const totalDays = workoutTemplates?.length || 0;
  const completedDays = workoutTemplates?.filter((t) => completedTemplateIds.has(t.id)).length || 0;
  const totalSetsThisWeek = workoutTemplates?.reduce(
    (sum, t) => sum + t.exercises.reduce((s, ex) => s + ex.targetSets, 0),
    0
  ) || 0;

  return (
    <div className="space-y-4 px-4 pt-6">
      <PageHeader title={program.name} subtitle={program.phase} />

      {/* Week Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              selectedWeek === week
                ? "btn-gradient-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            W{week}
          </button>
        ))}
      </div>

      {/* Weekly Summary Stats */}
      <div className="flex gap-3">
        <StatCard label="Total Sets" value={totalSetsThisWeek} />
        <StatCard label="Done" value={`${completedDays}/${totalDays}`} />
        <StatCard label="Remaining" value={totalDays - completedDays} />
      </div>

      {/* Day Cards — rotate so today is first when viewing current week */}
      <div className="space-y-2">
        {(selectedWeek === currentWeek && templates
          ? [...templates].sort((a, b) => {
              const today = new Date().getDay();
              return ((a.dayOfWeek - today + 7) % 7) - ((b.dayOfWeek - today + 7) % 7);
            })
          : templates
        )?.map((template) => {
          const date = getDateForDayInWeek(selectedWeek, template.dayOfWeek);
          const dayNum = date.getDate();
          const isCompleted = completedTemplateIds.has(template.id);
          const isToday =
            date.toDateString() === new Date().toDateString();
          const themeColor = getThemeColor(template.dayTheme);
          const themeLabel = getThemeLabel(template.dayTheme);
          const isRestDay = template.dayTheme === "rest";
          const totalSets = template.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
          const exerciseNames = template.exercises.slice(0, 3).map((ex) => ex.slotName || "Exercise");
          const extraCount = template.exercises.length - 3;

          const cardContent = (
            <Card
              className={`flex items-center gap-3.5 px-4 py-3.5 transition-all ${isRestDay ? "opacity-60" : "hover:translate-x-0.5"} border-l-[3px] ${themeColor.border} ${
                isToday ? "glass-card-elevated" : ""
              } ${isCompleted ? "bg-success-muted/30" : ""}`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl font-bold ${
                  isToday
                    ? "btn-gradient-primary text-primary-foreground"
                    : `${themeColor.bg}`
                }`}
              >
                <span className={`text-[10px] leading-none tracking-wider ${isToday ? "" : themeColor.text}`}>
                  {getDayAbbrev(template.dayOfWeek)}
                </span>
                <span className={`text-lg leading-tight ${isToday ? "" : themeColor.text}`}>
                  {dayNum}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">
                    {template.dayLabel}
                  </h3>
                  {isCompleted && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15">
                      <Check className="h-3 w-3 text-success" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {isRestDay ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Coffee className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Recover & recharge</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${themeColor.bg} ${themeColor.text}`}>
                        {themeLabel}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        · {totalSets} sets
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {exerciseNames.join(", ")}
                      {extraCount > 0 && ` +${extraCount} more`}
                    </p>
                  </>
                )}
              </div>

              {!isRestDay && (
                <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${isToday ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
              )}
            </Card>
          );

          return isRestDay ? (
            <div key={template.id}>{cardContent}</div>
          ) : (
            <Link
              key={template.id}
              href={`/today?week=${selectedWeek}&day=${template.dayOfWeek}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {(!templates || templates.length === 0) && (
        <Card className="px-4 py-10 text-center">
          <Dumbbell className="mx-auto h-16 w-16 text-muted-foreground/20" />
          <p className="mt-3 text-xl font-extrabold gradient-text">No workouts this week</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check another week or set up your program.
          </p>
        </Card>
      )}
    </div>
  );
}
