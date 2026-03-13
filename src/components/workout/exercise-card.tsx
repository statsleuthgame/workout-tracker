"use client";

import { useState, useEffect, useCallback } from "react";
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

interface ExerciseCardProps {
  exerciseId: string;
  workoutLogId: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes: string;
  slotType: "fixed" | "rotating";
  slotName: string;
  existingSets: SetLog[];
}

export function ExerciseCard({
  exerciseId,
  workoutLogId,
  targetSets,
  targetReps,
  restSeconds,
  notes,
  slotType,
  slotName,
  existingSets,
}: ExerciseCardProps) {
  const exercise = useExercise(exerciseId);
  const [expanded, setExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState<ProgressionSuggestion | null>(
    null
  );

  useEffect(() => {
    calculateProgression(exerciseId, targetReps).then(setSuggestion);
  }, [exerciseId, targetReps]);

  // Find existing log for this exercise (single record per exercise)
  const existingLog = existingSets.find(
    (s) => s.exerciseId === exerciseId && s.setNumber === 1
  );

  const completed = existingLog?.completed ?? false;
  const weight = existingLog?.actualWeight;

  const setId = `${workoutLogId}-${exerciseId}-1`;

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

  if (!exercise) return null;

  return (
    <Card
      className={`overflow-hidden transition-all ${
        completed ? "border-emerald-200 bg-emerald-50/30" : ""
      }`}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {exercise.videoUrl ? (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm text-blue-600 underline decoration-blue-300 underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                {exercise.name}
              </a>
            ) : (
              <h3 className="font-semibold text-sm">{exercise.name}</h3>
            )}
            {slotType === "rotating" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Variety
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {targetSets} sets x {targetReps} · {notes}
          </p>
        </div>

        {/* Done indicator */}
        <div className="flex items-center gap-2">
          {completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-emerald-600"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="space-y-3 px-4 pb-4 pt-0">
          <FormCueTip cues={exercise.formCues} />

          {suggestion && (
            <div className="rounded-lg bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium text-blue-700">
                {suggestion.label}
              </p>
            </div>
          )}

          {/* Weight input + Done button */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-3">
            <div className="text-center">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                WEIGHT (LBS)
              </p>
              <NumberInput
                value={weight}
                onChange={handleWeightChange}
                placeholder="Lbs"
                step={5}
              />
            </div>

            <div className="flex-1" />

            <button
              onClick={handleToggleComplete}
              className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
                completed
                  ? "bg-emerald-600 text-white active:bg-emerald-700"
                  : "bg-zinc-200 text-zinc-700 active:bg-zinc-300"
              }`}
            >
              {completed ? "Done" : "Mark Done"}
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
