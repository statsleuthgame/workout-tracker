import { db } from "../db/database";
import { supabase } from "./supabase";

// Field mappers (same as sync-push but we need them here for the initial bulk push)
function mapWorkoutLog(log: Record<string, unknown>) {
  return {
    id: log.id,
    template_id: log.templateId,
    date: log.date,
    started_at: log.startedAt,
    completed_at: log.completedAt,
    notes: log.notes,
  };
}

function mapSetLog(log: Record<string, unknown>) {
  return {
    id: log.id,
    workout_log_id: log.workoutLogId,
    exercise_id: log.exerciseId,
    set_number: log.setNumber,
    target_reps: log.targetReps,
    actual_reps: log.actualReps,
    target_weight: log.targetWeight,
    actual_weight: log.actualWeight,
    completed: log.completed,
    completed_at: log.completedAt,
  };
}

function mapBodyMetric(m: Record<string, unknown>) {
  return {
    id: m.id,
    date: m.date,
    weight: m.weight,
    notes: m.notes,
  };
}

let hasRun = false;

/**
 * One-time push of all existing local data to Supabase.
 * Runs once on first sync init to backfill the cloud with any data
 * that was created before the sync layer was added.
 */
export async function pushAllExistingData() {
  if (hasRun || !navigator.onLine) return;
  hasRun = true;

  try {
    // Check if cloud already has data (avoid duplicate push on every app load)
    const { count } = await supabase.from("workout_logs").select("*", { count: "exact", head: true });
    if (count && count > 0) return; // Cloud already has data

    const [workoutLogs, setLogs, bodyMetrics] = await Promise.all([
      db.workoutLogs.toArray(),
      db.setLogs.toArray(),
      db.bodyMetrics.toArray(),
    ]);

    if (workoutLogs.length === 0) return;

    const mappedWL = workoutLogs.map((l) => mapWorkoutLog(l as unknown as Record<string, unknown>));
    const mappedSL = setLogs.map((l) => mapSetLog(l as unknown as Record<string, unknown>));
    const mappedBM = bodyMetrics.map((m) => mapBodyMetric(m as unknown as Record<string, unknown>));

    // Push workout_logs first (set_logs reference them)
    if (mappedWL.length > 0) {
      const { error } = await supabase.from("workout_logs").upsert(mappedWL, { onConflict: "id" });
      if (error) console.warn("[sync] Initial push workout_logs error:", error.message);
    }

    if (mappedSL.length > 0) {
      // Push in batches of 500 to avoid payload limits
      for (let i = 0; i < mappedSL.length; i += 500) {
        const batch = mappedSL.slice(i, i + 500);
        const { error } = await supabase.from("set_logs").upsert(batch, { onConflict: "id" });
        if (error) console.warn("[sync] Initial push set_logs error:", error.message);
      }
    }

    if (mappedBM.length > 0) {
      const { error } = await supabase.from("body_metrics").upsert(mappedBM, { onConflict: "id" });
      if (error) console.warn("[sync] Initial push body_metrics error:", error.message);
    }

    console.log(`[sync] Initial push complete: ${mappedWL.length} workouts, ${mappedSL.length} sets, ${mappedBM.length} metrics`);
  } catch (err) {
    console.warn("[sync] Initial push error:", err);
  }
}
