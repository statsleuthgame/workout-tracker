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
  getLastWeight,
  type ProgressionSuggestion,
} from "@/lib/progression/engine";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { getThemeColor } from "@/lib/constants/theme-colors";

interface ExerciseCardProps {
  exerciseId: string;
  workoutLogId: string;
  targetSets: number;
  targetReps: string;
  notes: string;
  slotType: "fixed" | "rotating";
  slotName: string;
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
  slotName,
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

  useEffect(() => {
    if (isCardio) return;
    calculateProgression(exerciseId, targetReps).then(setSuggestion);
  }, [exerciseId, targetReps, isCardio]);

  // Find existing log for this exercise (single record per exercise)
  const existingLog = existingSets.find(
    (s) => s.exerciseId === exerciseId && s.setNumber === 1
  );

  const completed = existingLog?.completed ?? false;
  const weight = existingLog?.actualWeight;

  const setId = `${workoutLogId}-${exerciseId}-1`;

  // Auto-fill weight from last workout if no weight entered yet
  useEffect(() => {
    if (isCardio || hasAutoFilled.current) return;
    if (existingLog?.actualWeight) {
      hasAutoFilled.current = true;
      return;
    }
    getLastWeight(exerciseId).then((lastWeight) => {
      if (lastWeight && !hasAutoFilled.current) {
        hasAutoFilled.current = true;
        // Save to DB so it persists
        db.setLogs.get(setId).then((existing) => {
          if (existing) {
            if (!existing.actualWeight) {
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
      }
    });
  }, [exerciseId, setId, existingLog?.actualWeight, isCardio, workoutLogId, targetReps]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 border-l-[3px] ${dayTheme ? getThemeColor(dayTheme).border : "border-l-primary"} ${
        completed ? "border-success/30 bg-success-muted/30" : ""
      } ${popping ? "animate-pop" : ""}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
        aria-expanded={expanded}
        aria-label={`${exercise.name} — ${targetSets} sets x ${targetReps}`}
        className="flex w-full items-center justify-between pl-5 pr-4 py-3 text-left cursor-pointer"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {exercise.videoUrl ? (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm text-info underline decoration-info/30 underline-offset-2 hover:decoration-info/60 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {exercise.name}
              </a>
            ) : (
              <h3 className="font-bold text-sm">{exercise.name}</h3>
            )}
            {slotType === "rotating" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Variety
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCardio ? targetReps : `${targetSets} sets x ${targetReps}`} · {notes}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      {expanded && (
        <CardContent className="space-y-3 pl-5 pr-4 pb-4 pt-0">
          <FormCueTip cues={exercise.formCues} />

          {!isCardio && suggestion && (
            <div className="rounded-xl bg-info-muted/60 px-3 py-2 border border-info/10">
              <p className="text-xs font-semibold text-info">
                {suggestion.label}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-3">
            {!isCardio && (
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Weight (lbs)
                </p>
                <NumberInput
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder="Lbs"
                  step={5}
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
              className={`rounded-2xl px-6 py-4 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
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
