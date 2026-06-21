"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { useTemplateForDay, useSetLogs } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import {
  getDateString,
  getDayName,
  formatDate,
  parseDateString,
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

  // Use the date query param if provided (from week view), otherwise today.
  const paramDate = searchParams.get("date");
  const targetDate = paramDate ? parseDateString(paramDate) : new Date();
  const dateStr = getDateString(targetDate);
  const dayOfWeek = targetDate.getDay();

  const template = useTemplateForDay(dayOfWeek);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [showMeme, setShowMeme] = useState(false);
  const [memeExiting, setMemeExiting] = useState(false);
  const setLogs = useSetLogs(workoutLogId ?? undefined);

  // Debounced notes save
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Celebration phrase — deterministic from the date (pure render, SSR-stable).
  const celebrationPhrase = useMemo(() => {
    const seed = [...dateStr].reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return CELEBRATION_PHRASES[seed % CELEBRATION_PHRASES.length];
  }, [dateStr]);

  // Create or find the workout log — date-specific ID prevents collisions.
  // Skips rest days (no exercises) so viewing Sunday never writes a phantom log,
  // and a `cancelled` flag prevents a slow lookup for one date from applying a
  // stale workoutLogId after a fast switch to another date.
  useEffect(() => {
    // Skip until the template loads, and skip rest days (no exercises) so
    // viewing Sunday never writes a phantom log.
    if (!template || template.exercises.length === 0) return;

    let cancelled = false;
    (async () => {
      const logId = `log-${template.id}-${dateStr}`;
      const existing = await db.workoutLogs.get(logId);
      if (cancelled) return;

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
        if (cancelled) return;
        setWorkoutLogId(logId);
        setWorkoutNotes("");
        setIsFinished(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [template, dateStr]);

  const handleFinishWorkout = useCallback(async () => {
    if (!workoutLogId) return;
    await db.workoutLogs.update(workoutLogId, {
      completedAt: new Date().toISOString(),
    });
    setIsFinished(true);
    setShowMeme(true);
    navigator.vibrate?.([50, 100, 50]);

    // After 4.2s start exit animation, then hide at 5s
    setTimeout(() => setMemeExiting(true), 4200);
    setTimeout(() => {
      setShowMeme(false);
      setMemeExiting(false);
    }, 4700);
  }, [workoutLogId]);

  if (!template) {
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

  // Rest day — no exercises
  if (template.dayTheme === "rest") {
    return (
      <div className="space-y-4 px-4 pt-6">
        <PageHeader
          title="Rest Day"
          subtitle={`${getDayName(dayOfWeek)} · ${formatDate(dateStr)}`}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 text-6xl animate-milestone">&#9749;</div>
          <p className="text-2xl font-extrabold gradient-text">No workout today</p>
          <p className="mt-3 text-sm text-muted-foreground max-w-[240px]">
            Rest, recover, and come back stronger tomorrow.
          </p>
        </div>
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
        subtitle={`${getDayName(dayOfWeek)} · ${formatDate(dateStr)}`}
      />

      {/* Progress bar */}
      <div className="space-y-1.5 animate-slide-up">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{getProgressLabel(completedCount, totalCount)}</span>
          <span className="tabular-nums">
            {completedCount}/{totalCount} exercises
          </span>
        </div>
        <div
          className={`h-3.5 w-full overflow-hidden rounded-full bg-muted/60 ${progressPct > 0 ? "progress-glow" : ""}`}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} exercises completed`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progressPct > 0 && progressPct < 100 ? "progress-shimmer" : ""
            }`}
            style={{
              width: `${progressPct}%`,
              background:
                completedCount === totalCount && totalCount > 0
                  ? "var(--gradient-success)"
                  : "linear-gradient(90deg, var(--info), var(--success))",
            }}
          />
        </div>
      </div>

      {/* Exercise Cards */}
      {workoutLogId && (
        <div className="space-y-3 stagger-children">
          {template.exercises.map((ex) => (
            <ExerciseCard
              key={`${workoutLogId}-${ex.exerciseId}-${ex.order}`}
              exerciseId={ex.exerciseId}
              workoutLogId={workoutLogId}
              targetSets={ex.targetSets}
              targetReps={ex.targetReps}
              notes={ex.notes}
              slotType={ex.slotType}
              existingSets={setLogs || []}
              dayTheme={template.dayTheme}
            />
          ))}
        </div>
      )}

      {/* Finish Button / Completed State */}
      {isFinished ? (
        <div className="celebration-card rounded-2xl py-10 text-center backdrop-blur-xl border border-success/20">
          <p className="relative z-10 text-3xl font-extrabold gradient-text animate-milestone">
            Workout Complete
          </p>
          <p className="relative z-10 mt-3 text-sm text-muted-foreground italic">
            {celebrationPhrase}
          </p>
        </div>
      ) : (
        completedCount === totalCount &&
        totalCount > 0 && (
          <button
            onClick={handleFinishWorkout}
            className="w-full rounded-2xl btn-gradient-success py-4 text-lg font-bold animate-breathing-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-slide-up"
          >
            Finish Workout
          </button>
        )
      )}

      {/* Daily Log */}
      <div className="pb-6">
        <label
          htmlFor="daily-log"
          className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Daily Log
        </label>
        <textarea
          id="daily-log"
          className="mt-1.5 w-full rounded-2xl border border-border bg-card/50 backdrop-blur px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
          placeholder={
            [
              "How are you feeling today?",
              "Energy level? Mood? Wins?",
              "Anything worth remembering about today?",
              "What went well? What was tough?",
            ][dayOfWeek % 4]
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

      {/* Stay Strong meme overlay — decorative; tap to dismiss early */}
      {showMeme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => {
            setMemeExiting(true);
            setTimeout(() => {
              setShowMeme(false);
              setMemeExiting(false);
            }, 500);
          }}
        >
          <div className={memeExiting ? "animate-spin-out" : "animate-spin-in"}>
            <Image
              src="/stay-strong.png"
              alt=""
              width={280}
              height={280}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      )}
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
