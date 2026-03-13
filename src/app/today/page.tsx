"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
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
import { PageHeader } from "@/components/common/page-header";

const CELEBRATION_PHRASES = [
  "Crushed it!",
  "Beast mode!",
  "Stronger than yesterday.",
  "Another one in the books.",
  "Future you says thanks.",
  "That's how it's done.",
  "Rest now. You earned it.",
];

function getProgressLabel(completed: number, total: number): string {
  if (total === 0) return "Progress";
  if (completed === 0) return "Let's get started";
  if (completed === total) return "All done!";
  const remaining = total - completed;
  return `${remaining} to go`;
}

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

  // Debounced notes save
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Celebration phrase (stable per mount)
  const celebrationPhrase = useMemo(
    () => CELEBRATION_PHRASES[Math.floor(Math.random() * CELEBRATION_PHRASES.length)],
    []
  );

  // Create or find workout log — use date-specific ID to prevent collisions
  useEffect(() => {
    if (!template) return;

    (async () => {
      const logId = `log-${template.id}-${dateStr}`;
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
    navigator.vibrate?.([50, 100, 50]);
  }, [workoutLogId]);

  if (!template || !program) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="flex gap-1.5 text-muted-foreground">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <p className="text-sm text-muted-foreground">Getting your workout ready...</p>
      </div>
    );
  }

  // Count completed exercises (1 record per exercise in simplified model)
  const completedCount =
    setLogs?.filter((s) => s.completed).length || 0;
  const totalCount = template.exercises.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4 px-4 pt-6">
      {/* Header */}
      <PageHeader
        title={template.dayLabel}
        subtitle={`${getDayName(dayOfWeek)} · Week ${weekNumber} of ${program.weeks} · ${program.phase}`}
      />

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{getProgressLabel(completedCount, totalCount)}</span>
          <span>
            {completedCount}/{totalCount} exercises
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} exercises completed`}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background:
                completedCount === totalCount && totalCount > 0
                  ? "var(--success)"
                  : "linear-gradient(90deg, var(--info), var(--success))",
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
        <div className="animate-slide-up rounded-2xl bg-success-muted py-6 text-center">
          <p className="text-2xl font-bold text-success">
            Workout Complete
          </p>
          <p className="mt-1 text-sm text-success/80 italic">
            {celebrationPhrase}
          </p>
        </div>
      ) : (
        completedCount === totalCount &&
        totalCount > 0 && (
          <button
            onClick={handleFinishWorkout}
            className="w-full rounded-2xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-success/90"
          >
            Finish Workout
          </button>
        )
      )}

      {/* Daily Log */}
      <div className="pb-6">
        <label
          htmlFor="daily-log"
          className="text-xs font-semibold uppercase text-muted-foreground"
        >
          Daily Log
        </label>
        <textarea
          id="daily-log"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={
            [
              "How are you feeling today?",
              "Energy level? Mood? Wins?",
              "Anything worth remembering about today?",
              "What went well? What was tough?",
            ][new Date().getDay() % 4]
          }
          rows={3}
          value={workoutNotes}
          onChange={(e) => {
            const val = e.target.value;
            setWorkoutNotes(val);
            // Debounce DB write
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
              if (workoutLogId) {
                await db.workoutLogs.update(workoutLogId, { notes: val });
              }
            }, 500);
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
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
          <div className="flex gap-1.5 text-muted-foreground">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
          <p className="text-sm text-muted-foreground">Getting your workout ready...</p>
        </div>
      }
    >
      <TodayContent />
    </Suspense>
  );
}
