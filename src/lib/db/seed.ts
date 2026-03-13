import { db } from "./database";
import { exerciseLibrary } from "../workout-plan/exercises";
import { weeklyTemplate, getExercisesForDayWeek } from "../workout-plan/templates";

const PROGRAM_ID = "march-26-protocol";

export async function seedDatabase() {
  // Check if already seeded
  const existingProgram = await db.programs.get(PROGRAM_ID);
  if (existingProgram) return;

  // Seed exercise library
  await db.exercises.bulkPut(exerciseLibrary);

  // Seed program
  await db.programs.put({
    id: PROGRAM_ID,
    name: "March '26 Protocol",
    phase: "Phase 4: Volume & Intensity",
    startDate: "2026-03-08", // Week 1 starts Sunday March 8
    weeks: 5,
    proteinGoalG: 130,
    waterGoalL: 3,
    weightLossTarget: "5-7 lbs",
    createdAt: new Date().toISOString(),
  });

  // Seed workout templates for all 5 weeks x 7 days
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

  // Seed default settings
  await db.userSettings.put({
    id: "default",
    name: "",
    units: "lbs",
    restTimerDefault: 90,
    theme: "system",
    programStartDate: "2026-03-08",
  });
}
