import { db, type SetLog } from "../db/database";

export interface ProgressionSuggestion {
  targetWeight: number | null;
  targetReps: number;
  label: string; // e.g. "Last: 95 x 8 → Try: 100 x 8"
}

/**
 * Calculate progressive overload suggestion for an exercise.
 * Uses the most recent completed sets for that exercise to suggest next weight/reps.
 */
export async function calculateProgression(
  exerciseId: string,
  targetReps: string // e.g. "8-10" or "12"
): Promise<ProgressionSuggestion | null> {
  // Get all past set logs for this exercise, most recent first
  const pastSets = await db.setLogs
    .where("exerciseId")
    .equals(exerciseId)
    .toArray();

  if (pastSets.length === 0) return null;

  // Group by workoutLogId and find the most recent workout
  const byWorkout = new Map<string, SetLog[]>();
  for (const set of pastSets) {
    const existing = byWorkout.get(set.workoutLogId) || [];
    existing.push(set);
    byWorkout.set(set.workoutLogId, existing);
  }

  // Get workout logs to find dates
  const workoutIds = Array.from(byWorkout.keys());
  const workoutLogs = await db.workoutLogs.bulkGet(workoutIds);

  // Sort by date descending
  const sorted = workoutLogs
    .filter((w): w is NonNullable<typeof w> => w !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return null;

  const lastWorkoutId = sorted[0].id;
  const lastSets = byWorkout.get(lastWorkoutId) || [];
  const completedSets = lastSets.filter((s) => s.completed && s.actualWeight);

  if (completedSets.length === 0) return null;

  // Calculate average weight and reps from last session
  const avgWeight =
    completedSets.reduce((sum, s) => sum + (s.actualWeight || 0), 0) /
    completedSets.length;
  const avgReps =
    completedSets.reduce((sum, s) => sum + (s.actualReps || 0), 0) /
    completedSets.length;

  // Parse target reps
  const parsedTarget = parseReps(targetReps);

  // Progression logic:
  // If they hit the top of the rep range last time → suggest weight increase
  // Otherwise → suggest same weight, aim for more reps
  const hitTopOfRange = avgReps >= parsedTarget.max;
  const roundedLastWeight = Math.round(avgWeight);

  if (hitTopOfRange) {
    // Bump weight by ~5 lbs (or 2.5 for smaller muscles)
    const increment = avgWeight < 30 ? 2.5 : 5;
    const newWeight = Math.round(avgWeight + increment);
    return {
      targetWeight: newWeight,
      targetReps: parsedTarget.min,
      label: `Last: ${roundedLastWeight} x ${Math.round(avgReps)} → Try: ${newWeight} x ${parsedTarget.min}`,
    };
  } else {
    // Same weight, push for more reps
    const targetRepCount = Math.min(Math.round(avgReps) + 1, parsedTarget.max);
    return {
      targetWeight: roundedLastWeight,
      targetReps: targetRepCount,
      label: `Last: ${roundedLastWeight} x ${Math.round(avgReps)} → Try: ${roundedLastWeight} x ${targetRepCount}`,
    };
  }
}

function parseReps(reps: string): { min: number; max: number } {
  // Handle "8-10", "12", "15-20", etc.
  const match = reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return { min: 10, max: 12 };
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  return { min, max };
}

/**
 * Get the last weight used for an exercise (for pre-filling inputs)
 */
export async function getLastWeight(exerciseId: string): Promise<number | null> {
  const pastSets = await db.setLogs
    .where("exerciseId")
    .equals(exerciseId)
    .toArray();

  const completed = pastSets
    .filter((s) => s.completed && s.actualWeight)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));

  return completed.length > 0 ? completed[0].actualWeight || null : null;
}
