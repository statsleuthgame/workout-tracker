"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormCueTip } from "./form-cue-tip";
import { NumberInput } from "@/components/common/number-input";
import { db, type SetLog } from "@/lib/db/database";
import { useExercise } from "@/lib/db/hooks";
import {
  calculateProgression,
  type ProgressionSuggestion,
} from "@/lib/progression/engine";
import { CheckCircle2, ChevronDown, PlayCircle } from "lucide-react";
import { getThemeColor } from "@/lib/constants/theme-colors";

interface ExerciseCardProps {
  exerciseId: string;
  workoutLogId: string;
  targetSets: number;
  targetReps: string;
  notes: string;
  slotType: "fixed" | "rotating";
  existingSets: SetLog[];
  dayTheme?: string;
}

export function ExerciseCard({
  exerciseId,
  workoutLogId,
  targetSets,
  targetReps,
  notes,
  slotType,
  existingSets,
  dayTheme,
}: ExerciseCardProps) {
  const exercise = useExercise(exerciseId);
  const [expanded, setExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState<ProgressionSuggestion | null>(
    null
  );
  const [popping, setPopping] = useState(false);
  const popTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasAutoFilled = useRef(false);

  const isCardio = targetReps.toLowerCase().includes("min");

  // Find existing log for this exercise (single record per exercise)
  const existingLog = existingSets.find(
    (s) => s.exerciseId === exerciseId && s.setNumber === 1
  );

  const completed = existingLog?.completed ?? false;
  const weight = existingLog?.actualWeight;

  const setId = `${workoutLogId}-${exerciseId}-1`;

  // Load the progression reference and auto-fill the weight from the last
  // completed session — one history scan serves both. The card is keyed on
  // workoutLogId, so hasAutoFilled resets when navigating to another day.
  useEffect(() => {
    if (isCardio) return;
    let cancelled = false;
    calculateProgression(exerciseId, targetReps).then((result) => {
      if (cancelled) return;
      setSuggestion(result);

      if (hasAutoFilled.current || !result?.lastWeight) return;
      hasAutoFilled.current = true;
      const lastWeight = result.lastWeight;
      db.setLogs.get(setId).then((existing) => {
        if (cancelled) return;
        if (existing) {
          if (existing.actualWeight == null) {
            db.setLogs.update(setId, { actualWeight: lastWeight });
          }
        } else {
          db.setLogs.put({
            id: setId,
            workoutLogId,
            exerciseId,
            setNumber: 1,
            targetReps: parseTargetReps(targetReps),
            actualWeight: lastWeight,
            completed: false,
          });
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [exerciseId, targetReps, isCardio, setId, workoutLogId]);

  const handleToggleComplete = useCallback(async () => {
    const newCompleted = !completed;
    const existing = await db.setLogs.get(setId);

    if (existing) {
      await db.setLogs.update(setId, {
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : undefined,
      });
    } else {
      await db.setLogs.put({
        id: setId,
        workoutLogId,
        exerciseId,
        setNumber: 1,
        targetReps: parseTargetReps(targetReps),
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : undefined,
      });
    }

    // Haptic + pop animation on completion
    if (newCompleted) {
      navigator.vibrate?.(50);
      setPopping(true);
      clearTimeout(popTimeout.current);
      popTimeout.current = setTimeout(() => setPopping(false), 300);
    }
  }, [setId, completed, workoutLogId, exerciseId, targetReps]);

  const handleWeightChange = useCallback(
    async (newWeight: number | undefined) => {
      const existing = await db.setLogs.get(setId);

      if (existing) {
        await db.setLogs.update(setId, { actualWeight: newWeight });
      } else {
        await db.setLogs.put({
          id: setId,
          workoutLogId,
          exerciseId,
          setNumber: 1,
          targetReps: parseTargetReps(targetReps),
          actualWeight: newWeight,
          completed: false,
        });
      }
    },
    [setId, workoutLogId, exerciseId, targetReps]
  );

  if (!exercise) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </Card>
    );
  }

  const detail = isCardio ? targetReps : `${targetSets} sets x ${targetReps}`;

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 border-l-[3px] ${dayTheme ? getThemeColor(dayTheme).border : "border-l-primary"} ${
        completed ? "border-success/30 bg-success-muted/30" : "card-hover"
      } ${popping ? "animate-pop" : ""}`}
    >
      <div className="flex items-center gap-1 pl-5 pr-4 py-3.5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={`${exercise.name} — ${detail}`}
          className="flex flex-1 items-center justify-between gap-2 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2">
              <span className="font-bold text-sm truncate">{exercise.name}</span>
              {slotType === "rotating" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Variety
                </Badge>
              )}
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              {detail} · {notes}
            </span>
          </span>

          <span className="flex items-center gap-2 shrink-0">
            {completed && (
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
            )}
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </span>
        </button>

        {exercise.videoUrl && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${exercise.name} form video`}
            className="shrink-0 rounded-lg p-1.5 text-info transition-colors hover:bg-info-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        )}
      </div>

      {expanded && (
        <CardContent className="space-y-3 pl-5 pr-4 pb-4 pt-0 animate-slide-up">
          <FormCueTip cues={exercise.formCues} />

          {!isCardio && suggestion && (
            <div className="rounded-xl bg-info-muted/60 px-3 py-2.5 border border-info/10">
              <p className="text-xs font-semibold text-info">
                {suggestion.label}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3.5">
            {!isCardio && (
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  Weight (lbs)
                </p>
                <NumberInput
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder="Lbs"
                  step={5}
                  ariaLabel={`${exercise.name} weight in pounds`}
                />
              </div>
            )}

            {isCardio && (
              <p className="text-sm font-semibold text-muted-foreground">
                {targetReps}
              </p>
            )}

            <div className="flex-1" />

            <button
              onClick={handleToggleComplete}
              className={`rounded-2xl px-6 py-4 text-sm font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                completed
                  ? "btn-gradient-success"
                  : "btn-gradient-primary"
              }`}
            >
              {completed ? "Done!" : "Complete"}
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function parseTargetReps(reps: string): number {
  const match = reps.match(/(\d+)/);
  return match ? parseInt(match[1]) : 10;
}
