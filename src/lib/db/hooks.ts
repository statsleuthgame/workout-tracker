"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./database";

const PROGRAM_ID = "march-26-protocol";

export function useProgram() {
  return useLiveQuery(() => db.programs.get(PROGRAM_ID));
}

export function useExercise(id: string) {
  return useLiveQuery(() => db.exercises.get(id), [id]);
}

export function useTemplateForDay(weekNumber: number, dayOfWeek: number) {
  return useLiveQuery(
    () =>
      db.workoutTemplates
        .where("[programId+weekNumber+dayOfWeek]")
        .equals([PROGRAM_ID, weekNumber, dayOfWeek])
        .first(),
    [weekNumber, dayOfWeek]
  );
}

export function useTemplatesForWeek(weekNumber: number) {
  return useLiveQuery(
    () =>
      db.workoutTemplates
        .where("programId")
        .equals(PROGRAM_ID)
        .and((t) => t.weekNumber === weekNumber)
        .sortBy("dayOfWeek"),
    [weekNumber]
  );
}

export function useSetLogs(workoutLogId: string | undefined) {
  return useLiveQuery(
    () =>
      workoutLogId
        ? db.setLogs.where("workoutLogId").equals(workoutLogId).toArray()
        : [],
    [workoutLogId]
  );
}

export function useBodyMetrics() {
  return useLiveQuery(() => db.bodyMetrics.orderBy("date").toArray());
}

export function useWorkoutLogs() {
  return useLiveQuery(() => db.workoutLogs.orderBy("date").reverse().toArray());
}

export function useCompletedWorkoutsForWeek(weekNumber: number) {
  return useLiveQuery(async () => {
    const templates = await db.workoutTemplates
      .where("programId")
      .equals(PROGRAM_ID)
      .and((t) => t.weekNumber === weekNumber)
      .toArray();

    const templateIds = templates.map((t) => t.id);
    const logs = await db.workoutLogs
      .where("templateId")
      .anyOf(templateIds)
      .filter((log) => !!log.completedAt)
      .toArray();

    return logs;
  }, [weekNumber]);
}
