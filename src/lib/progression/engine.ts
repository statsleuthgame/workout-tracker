import { db, type SetLog } from "../db/database";

export interface ProgressionSuggestion {
  targetWeight: number | null; // suggested working weight (= last completed weight)
  lastWeight: number | null; // most recent completed weight, for pre-filling inputs
  targetReps: number;
  label: string; // e.g. "Last: 95 lbs · target 8-10 reps"
}

/**
 * Calculate the progressive-overload reference for an exercise.
 *
 * Reps are not tracked per set in the current UI (one tap = one completed
 * exercise), so progression is weight-based: surface the most recent COMPLETED
 * weight and the template's rep target. The weight input is pre-filled with the
 * last weight, so the user nudges it up to progress.
 */
export async function calculateProgression(
  exerciseId: string,
  targetReps: string // e.g. "8-10" or "12"
): Promise<ProgressionSuggestion | null> {
  // Only consider sets that were actually completed with a recorded weight.
  // Filter FIRST, then pick the most recent session — otherwise a not-yet-done
  // log for today (pre-filled weight, completed=false) hides the real history.
  const pastSets = await db.setLogs
    .where("exerciseId")
    .equals(exerciseId)
    .toArray();

  const completedSets = pastSets.filter(
    (s) => s.completed && s.actualWeight != null
  );
  if (completedSets.length === 0) return null;

  // Group the completed sets by workout, then find the most recent workout date.
  const byWorkout = new Map<string, SetLog[]>();
  for (const set of completedSets) {
    const existing = byWorkout.get(set.workoutLogId) || [];
    existing.push(set);
    byWorkout.set(set.workoutLogId, existing);
  }

  const workoutLogs = await db.workoutLogs.bulkGet(Array.from(byWorkout.keys()));
  const sorted = workoutLogs
    .filter((w): w is NonNullable<typeof w> => w != null)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return null;

  const lastSets = byWorkout.get(sorted[0].id) || [];
  if (lastSets.length === 0) return null;

  const avgWeight =
    lastSets.reduce((sum, s) => sum + (s.actualWeight || 0), 0) /
    lastSets.length;
  const lastWeight = Math.round(avgWeight);
  const parsed = parseReps(targetReps);

  return {
    targetWeight: lastWeight,
    lastWeight,
    targetReps: parsed.max,
    label: `Last: ${lastWeight} lbs · target ${targetReps} reps`,
  };
}

function parseReps(reps: string): { min: number; max: number } {
  // Handle "8-10", "12", "15-20", etc.
  const match = reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return { min: 10, max: 12 };
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  return { min, max };
}
