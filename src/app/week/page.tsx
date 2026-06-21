"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useWeekTemplates,
  useProgram,
  useCompletedDatesInRange,
} from "@/lib/db/hooks";
import {
  getDayAbbrev,
  getDateString,
  getWeekDates,
  formatWeekRange,
  isSameDay,
} from "@/lib/utils/dates";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { getThemeColor, getThemeLabel } from "@/lib/constants/theme-colors";
import { Check, ChevronLeft, ChevronRight, Coffee, Dumbbell } from "lucide-react";
import Link from "next/link";

export default function WeekPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const program = useProgram();
  const templates = useWeekTemplates();

  const weekDates = getWeekDates(weekOffset);
  const startStr = getDateString(weekDates[0]);
  const endStr = getDateString(weekDates[6]);
  const completedDates = useCompletedDatesInRange(startStr, endStr);

  if (!program || !templates) {
    return (
      <div className="space-y-4 px-4 pt-6">
        <div className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  // dayOfWeek -> template
  const templateByDay = new Map(templates.map((t) => [t.dayOfWeek, t]));

  const workoutDates = weekDates.filter((d) => d.getDay() !== 0); // exclude Sunday rest
  const totalDays = workoutDates.length;
  const completedDays = workoutDates.filter((d) =>
    completedDates?.has(getDateString(d))
  ).length;
  const totalSetsThisWeek = workoutDates.reduce((sum, d) => {
    const t = templateByDay.get(d.getDay());
    return sum + (t?.exercises.reduce((s, ex) => s + ex.targetSets, 0) ?? 0);
  }, 0);

  // For the current week, rotate so today comes first.
  const orderedDates =
    weekOffset === 0
      ? [...weekDates].sort((a, b) => {
          const today = new Date().getDay();
          return ((a.getDay() - today + 7) % 7) - ((b.getDay() - today + 7) % 7);
        })
      : weekDates;

  return (
    <div className="space-y-4 px-4 pt-6">
      <PageHeader title={program.name} subtitle={program.phase} />

      {/* Week navigation */}
      <div className="glass-card flex items-center justify-between rounded-2xl px-2 py-2">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Previous week"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold">
            {weekOffset === 0 ? "This Week" : formatWeekRange(weekDates)}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Back to this week
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Next week"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekly Summary Stats */}
      <div className="flex gap-3">
        <StatCard label="Total Sets" value={totalSetsThisWeek} />
        <StatCard label="Done" value={`${completedDays}/${totalDays}`} />
        <StatCard label="Remaining" value={totalDays - completedDays} />
      </div>

      {/* Day Cards */}
      <div className="space-y-2 stagger-children">
        {orderedDates.map((date) => {
          const dayOfWeek = date.getDay();
          const template = templateByDay.get(dayOfWeek);
          if (!template) return null;

          const dateStr = getDateString(date);
          const dayNum = date.getDate();
          const isCompleted = completedDates?.has(dateStr) ?? false;
          const isToday = isSameDay(date, new Date());
          const themeColor = getThemeColor(template.dayTheme);
          const themeLabel = getThemeLabel(template.dayTheme);
          const isRestDay = template.dayTheme === "rest";
          const totalSets = template.exercises.reduce(
            (sum, ex) => sum + ex.targetSets,
            0
          );
          const exerciseNames = template.exercises
            .slice(0, 3)
            .map((ex) => ex.slotName || "Exercise");
          const extraCount = template.exercises.length - 3;

          const cardContent = (
            <Card
              className={`flex items-center gap-3.5 px-4 py-3.5 transition-all duration-200 ${isRestDay ? "opacity-50" : "card-hover"} border-l-[3px] ${themeColor.border} ${
                isToday ? "glass-card-elevated animate-breathing-glow" : ""
              } ${isCompleted ? "bg-success-muted/30" : ""}`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl font-bold transition-transform duration-200 ${
                  isToday
                    ? "btn-gradient-primary text-primary-foreground shadow-lg"
                    : `${themeColor.bg}`
                }`}
              >
                <span className={`text-[10px] leading-none tracking-wider ${isToday ? "" : themeColor.text}`}>
                  {getDayAbbrev(dayOfWeek)}
                </span>
                <span className={`text-lg leading-tight ${isToday ? "" : themeColor.text}`}>
                  {dayNum}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{template.dayLabel}</h3>
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
            <div key={dateStr}>{cardContent}</div>
          ) : (
            <Link key={dateStr} href={`/today?date=${dateStr}`}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="px-4 py-10 text-center">
          <Dumbbell className="mx-auto h-16 w-16 text-muted-foreground/20" />
          <p className="mt-3 text-xl font-extrabold gradient-text">No workouts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your program is still loading.
          </p>
        </Card>
      )}
    </div>
  );
}
