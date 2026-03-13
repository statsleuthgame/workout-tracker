"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { RestTimer } from "@/components/workout/rest-timer";
import { useTemplateForDay, useSetLogs, useProgram } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import {
  getWeekNumber,
  getDayOfWeek,
  getDateString,
  getDayName,
} from "@/lib/utils/dates";

export default function TodayPage() {
  const today = new Date();
  const weekNumber = getWeekNumber(today);
  const dayOfWeek = getDayOfWeek(today);
  const dateStr = getDateString(today);

  const program = useProgram();
  const template = useTemplateForDay(weekNumber, dayOfWeek);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const setLogs = useSetLogs(workoutLogId ?? undefined);

  // Create or find workout log for today
  useEffect(() => {
    if (!template) return;

    (async () => {
      const existing = await db.workoutLogs
        .where("date")
        .equals(dateStr)
        .first();

      if (existing) {
        setWorkoutLogId(existing.id);
      } else {
        const id = `log-${dateStr}-${template.id}`;
        await db.workoutLogs.put({
          id,
          templateId: template.id,
          date: dateStr,
          startedAt: new Date().toISOString(),
          notes: "",
        });
        setWorkoutLogId(id);
      }
    })();
  }, [template, dateStr]);

  const handleFinishWorkout = useCallback(async () => {
    if (!workoutLogId) return;
    await db.workoutLogs.update(workoutLogId, {
      completedAt: new Date().toISOString(),
    });
  }, [workoutLogId]);

  if (!template || !program) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const completedSets = setLogs?.filter((s) => s.completed).length || 0;
  const totalSets = template.exercises.reduce(
    (sum, e) => sum + e.targetSets,
    0
  );

  return (
    <div className="space-y-4 px-4 pt-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{template.dayLabel}</h1>
          {template.dayTheme === "partner" && (
            <span className="text-xl">❤️</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {getDayName(dayOfWeek)} · Week {weekNumber} of {program.weeks} ·{" "}
          {program.phase}
        </p>
      </div>

      {/* Nutrition Goals */}
      <div className="flex gap-3">
        <Card className="flex-1 px-3 py-2 text-center">
          <p className="text-xs font-medium text-muted-foreground">Protein</p>
          <p className="text-lg font-bold">{program.proteinGoalG}g</p>
        </Card>
        <Card className="flex-1 px-3 py-2 text-center">
          <p className="text-xs font-medium text-muted-foreground">Water</p>
          <p className="text-lg font-bold">{program.waterGoalL}L+</p>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {completedSets}/{totalSets} sets
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Exercise Cards */}
      {workoutLogId && (
        <div className="space-y-3">
          {template.exercises.map((ex) => (
            <ExerciseCard
              key={`${ex.exerciseId}-${ex.order}`}
              exerciseId={ex.exerciseId}
              workoutLogId={workoutLogId}
              targetSets={ex.targetSets}
              targetReps={ex.targetReps}
              restSeconds={ex.restSeconds}
              notes={ex.notes}
              slotType={ex.slotType}
              slotName={ex.slotName}
              existingSets={setLogs || []}
            />
          ))}
        </div>
      )}

      {/* Finish Button */}
      {completedSets === totalSets && totalSets > 0 && (
        <button
          onClick={handleFinishWorkout}
          className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition-colors active:bg-emerald-700"
        >
          Finish Workout
        </button>
      )}

      {/* Daily Log */}
      <div className="pb-6">
        <label className="text-xs font-semibold uppercase text-muted-foreground">
          Daily Log
        </label>
        <textarea
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Notes on today's workout, energy levels..."
          rows={3}
          onChange={async (e) => {
            if (workoutLogId) {
              await db.workoutLogs.update(workoutLogId, {
                notes: e.target.value,
              });
            }
          }}
        />
      </div>

      {/* Rest Timer Overlay */}
      <RestTimer />
    </div>
  );
}
