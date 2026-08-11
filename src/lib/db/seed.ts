import { db } from "./database";
import { exerciseLibrary } from "../workout-plan/exercises";
import { weeklyPlan } from "../workout-plan/templates";

const PROGRAM_ID = "march-26-protocol";
const SEED_VERSION = 7; // bump this to force re-seed of templates & exercises

export async function seedDatabase() {
  const settings = await db.userSettings.get("default");
  const needsReseed = !settings || settings.seedVersion !== SEED_VERSION;

  if (!needsReseed) return;

  // Always update exercises (adds new movements, refreshes form cues / videos)
  await db.exercises.bulkPut(exerciseLibrary);

  // Seed or update program metadata
  await db.programs.put({
    id: PROGRAM_ID,
    name: "Upper / Lower Split",
    phase: "6-Day Split · Sculpt & Strong",
    createdAt: new Date().toISOString(),
  });

  // Evergreen routine: one template per day of week. Remove any templates from
  // a previous program structure so day lookups never collide.
  await db.workoutTemplates.where("programId").equals(PROGRAM_ID).delete();

  const templates = weeklyPlan.map((day) => ({
    id: `${PROGRAM_ID}-d${day.dayOfWeek}`,
    programId: PROGRAM_ID,
    weekNumber: 1,
    dayOfWeek: day.dayOfWeek,
    dayLabel: day.dayLabel,
    dayTheme: day.dayTheme,
    durationLabel: day.durationLabel,
    warmup: day.warmup,
    exercises: day.exercises,
  }));
  await db.workoutTemplates.bulkPut(templates);

  // Update settings with seed version
  await db.userSettings.put({
    id: "default",
    name: settings?.name ?? "",
    units: settings?.units ?? "lbs",
    restTimerDefault: settings?.restTimerDefault ?? 90,
    theme: settings?.theme ?? "system",
    seedVersion: SEED_VERSION,
  });
}
