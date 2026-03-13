"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SetRow } from "./set-row";
import { FormCueTip } from "./form-cue-tip";
import { db, type SetLog } from "@/lib/db/database";
import { useExercise } from "@/lib/db/hooks";
import { useAppStore } from "@/lib/store/app-store";
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
  const [expanded, setExpanded] = useState(true);
  const [suggestion, setSuggestion] = useState<ProgressionSuggestion | null>(
    null
  );
  const startTimer = useAppStore((s) => s.startTimer);

  useEffect(() => {
    calculateProgression(exerciseId, targetReps).then(setSuggestion);
  }, [exerciseId, targetReps]);

  // Build set data (existing or default)
  const sets: SetLog[] = [];
  for (let i = 1; i <= targetSets; i++) {
    const existing = existingSets.find(
      (s) => s.exerciseId === exerciseId && s.setNumber === i
    );
    if (existing) {
      sets.push(existing);
    } else {
      sets.push({
        id: `${workoutLogId}-${exerciseId}-${i}`,
        workoutLogId,
        exerciseId,
        setNumber: i,
        targetReps: parseTargetReps(targetReps),
        completed: false,
      });
    }
  }

  const completedCount = sets.filter((s) => s.completed).length;
  const allDone = completedCount === targetSets;

  const handleSetUpdate = useCallback(
    async (
      setNumber: number,
      update: Partial<SetLog>
    ) => {
      const setId = `${workoutLogId}-${exerciseId}-${setNumber}`;
      const existing = await db.setLogs.get(setId);

      if (existing) {
        await db.setLogs.update(setId, update);
      } else {
        await db.setLogs.put({
          id: setId,
          workoutLogId,
          exerciseId,
          setNumber,
          targetReps: parseTargetReps(targetReps),
          ...update,
        } as SetLog);
      }

      // Start rest timer when completing a set
      if (update.completed && restSeconds > 0) {
        startTimer(restSeconds);
      }
    },
    [workoutLogId, exerciseId, targetReps, restSeconds, startTimer]
  );

  if (!exercise) return null;

  return (
    <Card
      className={`overflow-hidden transition-all ${
        allDone ? "border-emerald-200 bg-emerald-50/30" : ""
      }`}
    >
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
                Rotating
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {targetSets} sets x {targetReps} · {notes}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold ${
              allDone ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {completedCount}/{targetSets}
          </span>
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

      {expanded && (
        <CardContent className="space-y-2 px-4 pb-4 pt-0">
          <FormCueTip cues={exercise.formCues} />

          {suggestion && (
            <div className="rounded-lg bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium text-blue-700">
                {suggestion.label}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            {sets.map((set) => (
              <SetRow
                key={set.setNumber}
                setNumber={set.setNumber}
                targetReps={targetReps}
                completed={set.completed}
                actualWeight={set.actualWeight}
                actualReps={set.actualReps}
                onWeightChange={(weight) =>
                  handleSetUpdate(set.setNumber, { actualWeight: weight })
                }
                onRepsChange={(reps) =>
                  handleSetUpdate(set.setNumber, { actualReps: reps })
                }
                onComplete={(completed) =>
                  handleSetUpdate(set.setNumber, {
                    completed,
                    completedAt: completed
                      ? new Date().toISOString()
                      : undefined,
                  })
                }
                suggestionLabel={
                  set.setNumber === 1 ? suggestion?.label : null
                }
              />
            ))}
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
