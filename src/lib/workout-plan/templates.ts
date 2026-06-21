import type { TemplateExercise } from "../db/database";

// Evergreen Push / Pull / Legs split (Mon–Sat, Sunday rest).
// The same routine repeats every week — there is no week-over-week
// progression or variety rotation. One fixed plan per day of week.

export interface DayPlan {
  dayOfWeek: number; // 0=Sun ... 6=Sat
  dayLabel: string;
  dayTheme: string;
  exercises: TemplateExercise[];
}

interface Move {
  id: string; // exercise id (must exist in the exercise library)
  label: string; // short name shown in the week-view preview
  sets: number;
  reps: string;
  rest: number; // seconds
  notes: string;
}

function buildExercises(moves: Move[]): TemplateExercise[] {
  return moves.map((m, i) => ({
    exerciseId: m.id,
    order: i + 1,
    targetSets: m.sets,
    targetReps: m.reps,
    restSeconds: m.rest,
    notes: m.notes,
    slotType: "fixed" as const,
    slotName: m.label,
  }));
}

// ===== PUSH (Mon & Thu): Chest, Shoulders, Triceps + cardio =====
const pushMoves: Move[] = [
  { id: "incline-db-press", label: "Incline DB Press", sets: 3, reps: "8-10", rest: 90, notes: "Heavy — signal muscle retention" },
  { id: "flat-bench", label: "Flat Bench", sets: 3, reps: "8-10", rest: 120, notes: "Touch chest, controlled press" },
  { id: "cable-fly", label: "Cable Flyes", sets: 3, reps: "12-15", rest: 60, notes: "Deep stretch, hard squeeze" },
  { id: "lateral-raise", label: "Lateral Raises", sets: 4, reps: "12-15", rest: 45, notes: "Caps the shoulders for a leaner look" },
  { id: "dip", label: "Tricep Dips", sets: 3, reps: "10-12", rest: 60, notes: "Machine-assisted or bench is fine" },
  { id: "incline-walk", label: "LISS Cardio", sets: 1, reps: "25 min", rest: 0, notes: "Incline walk · 3.0 mph · 6-8% incline" },
];

// ===== PULL (Tue & Fri): Back & Biceps =====
const pullMoves: Move[] = [
  { id: "lat-pulldown-wide", label: "Lat Pulldown", sets: 3, reps: "10-12", rest: 90, notes: "Wide grip, pull to upper chest" },
  { id: "seated-cable-row", label: "Cable Row", sets: 3, reps: "10-12", rest: 90, notes: "Close grip, squeeze shoulder blades" },
  { id: "face-pull", label: "Face Pulls", sets: 3, reps: "15", rest: 45, notes: "Posture + rear delt definition" },
  { id: "db-curl", label: "DB Curls", sets: 3, reps: "12", rest: 45, notes: "Strict form, no swinging" },
  { id: "hammer-curl", label: "Hammer Curls", sets: 3, reps: "12", rest: 45, notes: "Neutral grip, control the negative" },
];

// ===== LEGS (Wed): Quad & Calf focus =====
const legsQuadMoves: Move[] = [
  { id: "back-squat", label: "Squats", sets: 3, reps: "6-8", rest: 150, notes: "Barbell or hack squat — heavy & deep" },
  { id: "leg-press", label: "Leg Press", sets: 3, reps: "10-12", rest: 120, notes: "Full range, don't lock the knees" },
  { id: "leg-extension", label: "Leg Extensions", sets: 3, reps: "12-15", rest: 60, notes: "Defines the front of the thigh" },
  { id: "standing-calf-raise", label: "Calf Raises", sets: 4, reps: "15", rest: 45, notes: "Full stretch, pause at the top" },
];

// ===== LEGS (Sat): Glute & Hamstring focus =====
const legsGluteMoves: Move[] = [
  { id: "rdl", label: "RDLs", sets: 3, reps: "8-10", rest: 120, notes: "Hip hinge, stretch the hamstrings" },
  { id: "hip-thrust", label: "Hip Thrusts", sets: 3, reps: "10-12", rest: 90, notes: "Hold a 1s squeeze at the top" },
  { id: "lying-leg-curl", label: "Leg Curls", sets: 3, reps: "12-15", rest: 60, notes: "Lying or seated, point the toes" },
  { id: "calf-raise", label: "Seated Calf Raises", sets: 3, reps: "15", rest: 45, notes: "Slow negative, full stretch" },
];

export const weeklyPlan: DayPlan[] = [
  { dayOfWeek: 0, dayLabel: "Rest Day", dayTheme: "rest", exercises: [] },
  { dayOfWeek: 1, dayLabel: "Push (Chest & Shoulders)", dayTheme: "push-chest", exercises: buildExercises(pushMoves) },
  { dayOfWeek: 2, dayLabel: "Pull (Back & Biceps)", dayTheme: "pull-back", exercises: buildExercises(pullMoves) },
  { dayOfWeek: 3, dayLabel: "Legs (Quad & Calf)", dayTheme: "legs-foundation", exercises: buildExercises(legsQuadMoves) },
  { dayOfWeek: 4, dayLabel: "Push (Chest & Shoulders)", dayTheme: "push-shoulder", exercises: buildExercises(pushMoves) },
  { dayOfWeek: 5, dayLabel: "Pull (Back & Biceps)", dayTheme: "pull-rear", exercises: buildExercises(pullMoves) },
  { dayOfWeek: 6, dayLabel: "Legs (Glute & Hamstring)", dayTheme: "legs-hypertrophy", exercises: buildExercises(legsGluteMoves) },
];
