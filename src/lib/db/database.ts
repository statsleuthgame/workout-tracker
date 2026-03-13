import Dexie, { type EntityTable } from "dexie";

// ---- Entity Types ----

export interface Program {
  id: string;
  name: string;
  phase: string;
  startDate: string; // ISO date
  weeks: number;
  proteinGoalG: number;
  waterGoalL: number;
  weightLossTarget: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  formCues: string[];
}

export interface TemplateExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: string; // e.g. "8-10" or "15" or "30 min"
  restSeconds: number;
  notes: string;
  slotType: "fixed" | "rotating";
  slotName: string;
}

export interface WorkoutTemplate {
  id: string;
  programId: string;
  weekNumber: number;
  dayOfWeek: number; // 0=Sun ... 6=Sat
  dayLabel: string;
  dayTheme: string;
  exercises: TemplateExercise[];
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  date: string; // ISO date
  startedAt?: string;
  completedAt?: string;
  notes: string;
}

export interface SetLog {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  targetWeight?: number;
  actualWeight?: number;
  completed: boolean;
  completedAt?: string;
}

export interface BodyMetric {
  id: string;
  date: string; // ISO date
  weight?: number; // lbs
  notes?: string;
}

export interface UserSettings {
  id: string;
  name: string;
  units: "lbs" | "kg";
  restTimerDefault: number;
  theme: "light" | "dark" | "system";
  programStartDate?: string;
}

// ---- Database ----

const db = new Dexie("WorkoutDB") as Dexie & {
  programs: EntityTable<Program, "id">;
  exercises: EntityTable<Exercise, "id">;
  workoutTemplates: EntityTable<WorkoutTemplate, "id">;
  workoutLogs: EntityTable<WorkoutLog, "id">;
  setLogs: EntityTable<SetLog, "id">;
  bodyMetrics: EntityTable<BodyMetric, "id">;
  userSettings: EntityTable<UserSettings, "id">;
};

db.version(1).stores({
  programs: "id, name",
  exercises: "id, name, muscleGroup, equipment",
  workoutTemplates: "id, programId, [programId+weekNumber+dayOfWeek], weekNumber, dayOfWeek",
  workoutLogs: "id, templateId, date",
  setLogs: "id, workoutLogId, exerciseId, [workoutLogId+exerciseId]",
  bodyMetrics: "id, date",
  userSettings: "id",
});

export { db };
