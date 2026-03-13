import { db } from "../db/database";
import { getSupabase } from "./supabase";
import { setIsPulling } from "./sync-hooks";
import type { WorkoutLog, SetLog, BodyMetric } from "../db/database";

// snake_case to camelCase mapping
function toWorkoutLog(row: Record<string, unknown>): WorkoutLog {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    date: row.date as string,
    startedAt: row.started_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    notes: (row.notes as string) || "",
  };
}

function toSetLog(row: Record<string, unknown>): SetLog {
  return {
    id: row.id as string,
    workoutLogId: row.workout_log_id as string,
    exerciseId: row.exercise_id as string,
    setNumber: row.set_number as number,
    targetReps: row.target_reps as number,
    actualReps: row.actual_reps as number | undefined,
    targetWeight: row.target_weight as number | undefined,
    actualWeight: row.actual_weight as number | undefined,
    completed: row.completed as boolean,
    completedAt: row.completed_at as string | undefined,
  };
}

function toBodyMetric(row: Record<string, unknown>): BodyMetric {
  return {
    id: row.id as string,
    date: row.date as string,
    weight: row.weight as number | undefined,
    notes: row.notes as string | undefined,
  };
}

export async function pullFromCloud(): Promise<boolean> {
  // Only pull if local DB is empty (cache was cleared)
  const localCount = await db.workoutLogs.count();
  if (localCount > 0) return false;

  if (!navigator.onLine) return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const [wlRes, slRes, bmRes] = await Promise.all([
      supabase.from("workout_logs").select("*"),
      supabase.from("set_logs").select("*"),
      supabase.from("body_metrics").select("*"),
    ]);

    if (wlRes.error || slRes.error || bmRes.error) {
      console.warn("[sync] Pull error:", wlRes.error || slRes.error || bmRes.error);
      return false;
    }

    const workoutLogs = (wlRes.data || []).map(toWorkoutLog);
    const setLogs = (slRes.data || []).map(toSetLog);
    const bodyMetrics = (bmRes.data || []).map(toBodyMetric);

    if (workoutLogs.length === 0 && setLogs.length === 0 && bodyMetrics.length === 0) {
      return false;
    }

    // Disable hooks during pull to avoid re-enqueuing
    setIsPulling(true);
    try {
      await db.transaction("rw", [db.workoutLogs, db.setLogs, db.bodyMetrics], async () => {
        if (workoutLogs.length > 0) await db.workoutLogs.bulkPut(workoutLogs);
        if (setLogs.length > 0) await db.setLogs.bulkPut(setLogs);
        if (bodyMetrics.length > 0) await db.bodyMetrics.bulkPut(bodyMetrics);
      });
      console.log(`[sync] Restored ${workoutLogs.length} workouts, ${setLogs.length} sets, ${bodyMetrics.length} metrics from cloud`);
      return true;
    } finally {
      setIsPulling(false);
    }
  } catch (err) {
    console.warn("[sync] Pull error:", err);
    return false;
  }
}
