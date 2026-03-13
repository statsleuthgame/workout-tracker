"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { useTemplateForDay, useSetLogs, useProgram } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import {
  getWeekNumber,
  getDayOfWeek,
  getDateString,
  getDayName,
  getDateForDayInWeek,
} from "@/lib/utils/dates";

function TodayContent() {
  const searchParams = useSearchParams();
  const today = new Date();

  // Use query params if provided (from week view), otherwise use today's date
  const paramWeek = searchParams.get("week");
  const paramDay = searchParams.get("day");

  const weekNumber = paramWeek ? parseInt(paramWeek) : getWeekNumber(today);
  const dayOfWeek = paramDay !== null ? parseInt(paramDay) : getDayOfWeek(today);

  // Use the correct date for the selected day (not always today)
  const targetDate = paramWeek
    ? getDateForDayInWeek(weekNumber, dayOfWeek)
    : today;
  const dateStr = getDateString(targetDate);

  const program = useProgram();
  const template = useTemplateForDay(weekNumber, dayOfWeek);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const setLogs = useSetLogs(workoutLogId ?? undefined);

  // Create or find workout log
  useEffect(() => {
    if (!template) return;

    (async () => {
      const logId = `log-${template.id}`;
      const existing = await db.workoutLogs.get(logId);

      if (existing) {
        setWorkoutLogId(existing.id);
        setWorkoutNotes(existing.notes || "");
        setIsFinished(!!existing.completedAt);
      } else {
        await db.workoutLogs.put({
          id: logId,
          templateId: template.id,
          date: dateStr,
          startedAt: new Date().toISOString(),
          notes: "",
        });
        setWorkoutLogId(logId);
        setWorkoutNotes("");
        setIsFinished(false);
      }
    })();
  }, [template, dateStr]);

  const handleFinishWorkout = useCallback(async () => {
    if (!workoutLogId) return;
    await db.workoutLogs.update(workoutLogId, {
      completedAt: new Date().toISOString(),
    });
    setIsFinished(true);
  }, [workoutLogId]);

  if (!template || !program) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Count completed exercises (1 record per exercise in simplified model)
  const completedCount =
    setLogs?.filter((s) => s.completed).length || 0;
  const totalCount = template.exercises.length;

  return (
    <div className="space-y-4 px-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{template.dayLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {getDayName(dayOfWeek)} · Week {weekNumber} of {program.weeks} ·{" "}
          {program.phase}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {completedCount}/{totalCount} exercises
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} exercises completed`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
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
              notes={ex.notes}
              slotType={ex.slotType}
              slotName={ex.slotName}
              existingSets={setLogs || []}
            />
          ))}
        </div>
      )}

      {/* Finish Button / Completed State */}
      {isFinished ? (
        <div className="rounded-2xl bg-emerald-50 py-4 text-center">
          <p className="text-lg font-bold text-emerald-700">
            Workout Complete!
          </p>
        </div>
      ) : (
        completedCount === totalCount &&
        totalCount > 0 && (
          <button
            onClick={handleFinishWorkout}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition-colors active:bg-emerald-700"
          >
            Finish Workout
          </button>
        )
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
          value={workoutNotes}
          onChange={async (e) => {
            const val = e.target.value;
            setWorkoutNotes(val);
            if (workoutLogId) {
              await db.workoutLogs.update(workoutLogId, {
                notes: val,
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <TodayContent />
    </Suspense>
  );
}
