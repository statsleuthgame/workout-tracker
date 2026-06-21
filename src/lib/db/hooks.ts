"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./database";

const PROGRAM_ID = "march-26-protocol";
// Evergreen plan: all 7 day templates are stored under a single week slot.
const TEMPLATE_WEEK = 1;

export function useProgram() {
  return useLiveQuery(() => db.programs.get(PROGRAM_ID));
}

export function useExercise(id: string) {
  return useLiveQuery(() => db.exercises.get(id), [id]);
}

export function useTemplateForDay(dayOfWeek: number) {
  return useLiveQuery(
    () =>
      db.workoutTemplates
        .where("[programId+weekNumber+dayOfWeek]")
        .equals([PROGRAM_ID, TEMPLATE_WEEK, dayOfWeek])
        .first(),
    [dayOfWeek]
  );
}

export function useWeekTemplates() {
  return useLiveQuery(() =>
    db.workoutTemplates.where("programId").equals(PROGRAM_ID).sortBy("dayOfWeek")
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

// Set of completed workout dates (YYYY-MM-DD) within an inclusive date range.
export function useCompletedDatesInRange(startDate: string, endDate: string) {
  return useLiveQuery(async () => {
    const logs = await db.workoutLogs
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();
    return new Set(logs.filter((l) => l.completedAt).map((l) => l.date));
  }, [startDate, endDate]);
}
