import type { TemplateExercise, WarmupItem } from "../db/database";

// Evergreen Upper/Lower split (Mon–Sat, Sunday rest) from the
// "Monday–Sunday Customized Workout Split & Guide V2".
// Upper days (Mon/Wed/Fri) end with LISS cardio; lower days (Tue/Thu/Sat)
// alternate hamstring/glute and quad/calf focus. The same routine repeats
// every week — one fixed plan per day of week.

export interface DayPlan {
  dayOfWeek: number; // 0=Sun ... 6=Sat
  dayLabel: string;
  dayTheme: string;
  durationLabel?: string; // estimated session time, e.g. "~75 min"
  warmup?: { title: string; items: WarmupItem[] };
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

// ===== Dynamic warm-ups (5–8 min) =====

const upperWarmup = {
  title: "Upper Body Warm-Up · 5–8 min",
  items: [
    { name: "Arm Circles & Cross-Body Hugs", detail: "15 reps forward/backward · opens shoulders & chest" },
    { name: "Band Pull-Aparts or Light Face Pulls", detail: "15–20 reps · activates rear delts & upper back" },
    { name: "Cat-Cow Stretch", detail: "10 reps · mobilizes spine" },
    { name: "Warm-Up Set", detail: "1 light set (~50% working weight) of your first exercise" },
  ],
};

const lowerWarmup = {
  title: "Lower Body Warm-Up · 5–8 min",
  items: [
    { name: "Bodyweight Hip Hinges / Good Mornings", detail: "15 reps · primes hamstrings & hinge pattern" },
    { name: "Leg Swings (front-back & side-side)", detail: "10–12 per leg · opens hip flexors & adductors" },
    { name: "Bodyweight Glute Bridges", detail: "15 reps · activates glutes before heavy lifts" },
    { name: "Deep Squat Hold", detail: "30 seconds · opens ankles & hips" },
    { name: "Warm-Up Sets", detail: "1–2 progressive lighter sets of your first main movement" },
  ],
};

// ===== MONDAY: Upper Body (Push Focus) + Cardio =====
const mondayMoves: Move[] = [
  { id: "incline-db-press", label: "Incline DB Press", sets: 3, reps: "8-10", rest: 90, notes: "Upper chest & shoulder framing" },
  { id: "flat-bench", label: "Flat Bench Press", sets: 3, reps: "8-10", rest: 120, notes: "Touch chest, controlled press" },
  { id: "cable-fly", label: "Cable Chest Flyes", sets: 3, reps: "12-15", rest: 60, notes: "Deep stretch, hard squeeze" },
  { id: "lateral-raise", label: "Lateral Raises", sets: 4, reps: "12-15", rest: 45, notes: "Rounds out the shoulder caps" },
  { id: "overhead-tricep", label: "Overhead Tricep Ext", sets: 3, reps: "12-15", rest: 60, notes: "Long head of triceps — underarm focus" },
  { id: "incline-walk", label: "LISS Cardio", sets: 1, reps: "20-25 min", rest: 0, notes: "Incline walk · 3.0 mph · 6-8% incline" },
];

// ===== TUESDAY: Lower Body (Hamstring & Glute Focus) =====
const tuesdayMoves: Move[] = [
  { id: "rdl", label: "RDLs", sets: 4, reps: "8-10", rest: 120, notes: "Heavy compound first while 100% fresh" },
  { id: "hip-thrust", label: "Hip Thrusts", sets: 3, reps: "10-12", rest: 90, notes: "Peak glute energy — hold the squeeze" },
  { id: "lying-leg-curl", label: "Leg Curls", sets: 3, reps: "12-15", rest: 60, notes: "Lying or seated, zero back fatigue" },
  { id: "single-leg-rdl", label: "Single-Leg RDLs", sets: 3, reps: "10/leg", rest: 60, notes: "Unilateral balance finisher" },
  { id: "hip-abductor", label: "Hip Abductions", sets: 3, reps: "15-20", rest: 45, notes: "Glute medius burn-out" },
  { id: "cable-rdl", label: "Cable RDLs", sets: 3, reps: "12-15", rest: 60, notes: "Constant-tension hinge" },
];

// ===== WEDNESDAY: Upper Body (Pull Focus) + Cardio =====
const wednesdayMoves: Move[] = [
  { id: "lat-pulldown-wide", label: "Lat Pulldown", sets: 3, reps: "10-12", rest: 90, notes: "Wide grip — upper back width" },
  { id: "seated-cable-row", label: "Cable Row", sets: 3, reps: "10-12", rest: 90, notes: "Close grip, squeeze shoulder blades" },
  { id: "face-pull", label: "Face Pulls", sets: 3, reps: "15", rest: 45, notes: "Rear delts & posture" },
  { id: "db-curl", label: "DB Curls", sets: 3, reps: "12", rest: 45, notes: "Strict form, no swinging" },
  { id: "hammer-curl", label: "Hammer Curls", sets: 3, reps: "12", rest: 45, notes: "Neutral grip, control the negative" },
  { id: "standing-ab-crunch", label: "Standing Ab Crunches", sets: 3, reps: "near failure", rest: 45, notes: "Abs do the work, not the arms" },
  { id: "incline-walk", label: "LISS Cardio", sets: 1, reps: "25 min", rest: 0, notes: "Incline walk · 3.0 mph · 6-8% incline" },
];

// ===== THURSDAY: Lower Body (Quad & Calf Focus) =====
const thursdayMoves: Move[] = [
  { id: "heels-elevated-squat", label: "Front Squats", sets: 3, reps: "8-10", rest: 150, notes: "Heels-elevated DB front squat or hack squat" },
  { id: "leg-press", label: "Leg Press", sets: 3, reps: "10-12", rest: 120, notes: "Full range, don't lock the knees" },
  { id: "leg-extension", label: "Leg Extensions", sets: 3, reps: "12-15", rest: 60, notes: "Hold 1s at the top" },
  { id: "hip-adductor", label: "Hip Adductions", sets: 3, reps: "12-15", rest: 45, notes: "Inner thigh focus" },
  { id: "standing-calf-raise", label: "Calf Raises", sets: 4, reps: "15", rest: 45, notes: "Full stretch, pause at the top" },
];

// ===== FRIDAY: Upper Body (Sculpt & Core) + Cardio =====
const fridayMoves: Move[] = [
  { id: "straight-arm-pulldown", label: "Straight-Arm Pulldowns", sets: 3, reps: "12", rest: 60, notes: "Lat engagement first, before tricep fatigue" },
  { id: "lateral-raise", label: "Lateral Raises", sets: 4, reps: "12-15", rest: 45, notes: "Rounds out the shoulder caps" },
  { id: "overhead-tricep", label: "Overhead Tricep Ext", sets: 3, reps: "12-15", rest: 60, notes: "Extra underarm focus" },
  { id: "rope-pushdown", label: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: 45, notes: "Elbows pinned, squeeze at the bottom" },
  { id: "standing-ab-crunch", label: "Standing Ab Crunches", sets: 3, reps: "near failure", rest: 45, notes: "Abs do the work, not the arms" },
  { id: "incline-walk", label: "LISS Cardio", sets: 1, reps: "20-25 min", rest: 0, notes: "Incline walk · 3.0 mph · 6-8% incline" },
];

// ===== SATURDAY: Lower Body (Hamstring & Glute Volume) =====
const saturdayMoves: Move[] = [
  { id: "rdl", label: "RDLs", sets: 3, reps: "10-12", rest: 120, notes: "Or single-leg RDLs — deep hamstring stretch" },
  { id: "lying-leg-curl", label: "Leg Curls", sets: 4, reps: "12-15", rest: 60, notes: "Lying or seated, point the toes" },
  { id: "leg-press-high-wide", label: "Leg Press (High & Wide)", sets: 3, reps: "10-12", rest: 90, notes: "Feet high & wide — glute bias" },
  { id: "hip-abductor", label: "Hip Abductions", sets: 3, reps: "15-20", rest: 45, notes: "Glute medius burn-out" },
  { id: "calf-raise", label: "Seated Calf Raises", sets: 3, reps: "15", rest: 45, notes: "Slow negative, full stretch" },
];

export const weeklyPlan: DayPlan[] = [
  { dayOfWeek: 0, dayLabel: "Rest Day", dayTheme: "rest", exercises: [] },
  { dayOfWeek: 1, dayLabel: "Upper Body · Push", dayTheme: "upper-push", durationLabel: "~75 min", warmup: upperWarmup, exercises: buildExercises(mondayMoves) },
  { dayOfWeek: 2, dayLabel: "Lower Body · Hams & Glutes", dayTheme: "lower-ham-glute", durationLabel: "50–55 min", warmup: lowerWarmup, exercises: buildExercises(tuesdayMoves) },
  { dayOfWeek: 3, dayLabel: "Upper Body · Pull", dayTheme: "upper-pull", durationLabel: "70–75 min", warmup: upperWarmup, exercises: buildExercises(wednesdayMoves) },
  { dayOfWeek: 4, dayLabel: "Lower Body · Quads & Calves", dayTheme: "lower-quad", durationLabel: "50–55 min", warmup: lowerWarmup, exercises: buildExercises(thursdayMoves) },
  { dayOfWeek: 5, dayLabel: "Upper Body · Sculpt & Core", dayTheme: "upper-sculpt", durationLabel: "65–70 min", warmup: upperWarmup, exercises: buildExercises(fridayMoves) },
  { dayOfWeek: 6, dayLabel: "Lower Body · Glute Volume", dayTheme: "lower-glute-volume", durationLabel: "50–55 min", warmup: lowerWarmup, exercises: buildExercises(saturdayMoves) },
];
