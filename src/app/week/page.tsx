"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";

export default function WeekPage() {
  const currentWeek = getWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const program = useProgram();
  const templates = useTemplatesForWeek(selectedWeek);
  const completedWorkouts = useCompletedWorkoutsForWeek(selectedWeek);

  if (!program) return null;

  const completedTemplateIds = new Set(
    completedWorkouts?.map((w) => w.templateId) || []
  );

  return (
    <div className="space-y-4 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">{program.name}</h1>
        <p className="text-sm text-muted-foreground">{program.phase}</p>
      </div>

      {/* Phase Update Banner */}
      <div className="rounded-xl bg-emerald-50 px-4 py-2.5">
        <p className="text-sm font-medium text-emerald-800">
          <span className="font-bold">Phase 4 Update:</span> One new exercise
          added daily. Target weight loss: {program.weightLossTarget}.
        </p>
      </div>

      {/* Week Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: program.weeks }, (_, i) => i + 1).map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
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
                } ${isCompleted ? "bg-emerald-50/50" : ""}`}
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
