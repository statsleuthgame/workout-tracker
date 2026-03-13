import { db } from "./database";
import { exerciseLibrary } from "../workout-plan/exercises";
import { weeklyTemplate, getExercisesForDayWeek } from "../workout-plan/templates";

const PROGRAM_ID = "march-26-protocol";
const SEED_VERSION = 4; // bump this to force re-seed of templates & exercises

export async function seedDatabase() {
  const settings = await db.userSettings.get("default");
  const needsReseed = !settings || settings.seedVersion !== SEED_VERSION;

  if (!needsReseed) return;

  // Always update exercises (adds videoUrl, removes partner exercises)
  await db.exercises.bulkPut(exerciseLibrary);

  // Seed or update program
  await db.programs.put({
    id: PROGRAM_ID,
    name: "March '26 Protocol",
    phase: "Phase 4: Volume & Intensity",
    startDate: "2026-03-08",
    weeks: 5,
    weightLossTarget: "5-7 lbs",
    createdAt: new Date().toISOString(),
  });

  // Reseed all workout templates (Saturday changed to full body, etc.)
  const templates = [];
  for (let week = 1; week <= 5; week++) {
    for (const day of weeklyTemplate) {
      templates.push({
        id: `${PROGRAM_ID}-w${week}-d${day.dayOfWeek}`,
        programId: PROGRAM_ID,
        weekNumber: week,
        dayOfWeek: day.dayOfWeek,
        dayLabel: day.dayLabel,
        dayTheme: day.dayTheme,
        exercises: getExercisesForDayWeek(day, week),
      });
    }
  }
  await db.workoutTemplates.bulkPut(templates);

  // Update settings with seed version
  await db.userSettings.put({
    id: "default",
    name: "",
    units: "lbs",
    restTimerDefault: 90,
    theme: "system",
    programStartDate: "2026-03-08",
    seedVersion: SEED_VERSION,
  });
}
