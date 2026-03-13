import type { TemplateExercise } from "../db/database";

// Each day defines exercise slots. "fixed" slots stay all 5 weeks.
// "rotating" slots change per week for variety.

interface DayTemplate {
  dayLabel: string;
  dayTheme: string;
  dayOfWeek: number; // 0=Sun ... 6=Sat
  slots: SlotDefinition[];
}

interface SlotDefinition {
  slotName: string;
  slotType: "fixed" | "rotating";
  exercisesByWeek: Record<number, string>; // week (1-5) -> exerciseId
  setsByWeek: Record<number, number>;
  repsByWeek: Record<number, string>;
  restSeconds: number;
  notes: string;
}

// Helper: same exercise all weeks
function fixed(id: string): Record<number, string> {
  return { 1: id, 2: id, 3: id, 4: id, 5: id };
}

// Progression patterns
const PROG_3_TO_4: Record<number, number> = { 1: 3, 2: 3, 3: 3, 4: 4, 5: 4 };
const PROG_4_ALL: Record<number, number> = { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 };
const PROG_3_ALL: Record<number, number> = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };

// ===== SUNDAY: Active Recovery =====
const sunday: DayTemplate = {
  dayLabel: "Active Recovery & Prep",
  dayTheme: "recovery",
  dayOfWeek: 0,
  slots: [
    {
      slotName: "Light Cardio",
      slotType: "fixed",
      exercisesByWeek: fixed("incline-walk"),
      setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      repsByWeek: { 1: "20 min", 2: "20 min", 3: "25 min", 4: "20 min", 5: "25 min" },
      restSeconds: 0,
      notes: "Easy pace, zone 2",
    },
    {
      slotName: "Core Mobility",
      slotType: "fixed",
      exercisesByWeek: fixed("plank"),
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "30 sec", 2: "40 sec", 3: "45 sec", 4: "45 sec", 5: "60 sec" },
      restSeconds: 30,
      notes: "Focus on breathing and stability",
    },
  ],
};

// ===== MONDAY: Back Width + Biceps =====
const monday: DayTemplate = {
  dayLabel: "Back Width & Biceps",
  dayTheme: "pull-vertical",
  dayOfWeek: 1,
  slots: [
    {
      slotName: "Primary Pull",
      slotType: "fixed",
      exercisesByWeek: fixed("pullup"),
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "6-8", 2: "8-10", 3: "8-10", 4: "6-8", 5: "8-10" },
      restSeconds: 120,
      notes: "Use assistance if needed. Full stretch at bottom.",
    },
    {
      slotName: "Lat Variation",
      slotType: "rotating",
      exercisesByWeek: { 1: "lat-pulldown-wide", 2: "lat-pulldown-neutral", 3: "cable-pullover", 4: "lat-pulldown-wide", 5: "single-arm-lat-pulldown" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "10-12", 2: "12", 3: "12-15", 4: "10-12", 5: "12" },
      restSeconds: 90,
      notes: "Focus on mind-muscle connection with lats",
    },
    {
      slotName: "Lat Accessory",
      slotType: "rotating",
      exercisesByWeek: { 1: "straight-arm-pulldown", 2: "straight-arm-pulldown", 3: "single-arm-lat-pulldown", 4: "cable-pullover", 5: "straight-arm-pulldown" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12-15", 2: "15", 3: "12/side", 4: "12-15", 5: "15" },
      restSeconds: 60,
      notes: "Squeeze and stretch",
    },
    {
      slotName: "Bicep Primary",
      slotType: "fixed",
      exercisesByWeek: fixed("ez-bar-curl"),
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "10-12", 2: "12", 3: "12", 4: "10-12", 5: "12" },
      restSeconds: 60,
      notes: "Strict form, no swinging",
    },
    {
      slotName: "Bicep Accessory",
      slotType: "rotating",
      exercisesByWeek: { 1: "hammer-curl", 2: "incline-db-curl", 3: "spider-curl", 4: "hammer-curl", 5: "concentration-curl" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "12", 3: "10-12", 4: "12", 5: "12" },
      restSeconds: 60,
      notes: "Feel the stretch and squeeze",
    },
    {
      slotName: "Finisher",
      slotType: "fixed",
      exercisesByWeek: fixed("incline-walk"),
      setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      repsByWeek: { 1: "15 min", 2: "15 min", 3: "20 min", 4: "15 min", 5: "20 min" },
      restSeconds: 0,
      notes: "Zone 2 heart rate, cool down",
    },
  ],
};

// ===== TUESDAY: Shoulders, Triceps & Core =====
const tuesday: DayTemplate = {
  dayLabel: "Shoulders, Triceps & Core",
  dayTheme: "push-overhead",
  dayOfWeek: 2,
  slots: [
    {
      slotName: "Shoulder Press",
      slotType: "fixed",
      exercisesByWeek: fixed("db-overhead-press"),
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
      restSeconds: 90,
      notes: "Core tight, neutral spine",
    },
    {
      slotName: "Lateral Delt",
      slotType: "rotating",
      exercisesByWeek: { 1: "lateral-raise", 2: "cable-lateral-raise", 3: "lateral-raise", 4: "cable-lateral-raise", 5: "lateral-raise" },
      setsByWeek: PROG_4_ALL,
      repsByWeek: { 1: "15-20", 2: "15-20", 3: "15-20", 4: "15-20", 5: "15-20" },
      restSeconds: 45,
      notes: "Lead with elbows, light weight",
    },
    {
      slotName: "Tricep Compound",
      slotType: "rotating",
      exercisesByWeek: { 1: "skullcrusher", 2: "close-grip-bench", 3: "dip", 4: "skullcrusher", 5: "close-grip-bench" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "10-12", 2: "8-10", 3: "8-12", 4: "10-12", 5: "8-10" },
      restSeconds: 90,
      notes: "Keep elbows tucked",
    },
    {
      slotName: "Tricep Isolation",
      slotType: "rotating",
      exercisesByWeek: { 1: "rope-pushdown", 2: "overhead-tricep", 3: "rope-pushdown", 4: "tricep-kickback", 5: "overhead-tricep" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "15", 2: "12", 3: "15", 4: "15", 5: "12" },
      restSeconds: 45,
      notes: "Spread rope at bottom / full stretch overhead",
    },
    {
      slotName: "Core A",
      slotType: "rotating",
      exercisesByWeek: { 1: "hanging-leg-raise", 2: "ab-wheel", 3: "hanging-leg-raise", 4: "pallof-press", 5: "hanging-leg-raise" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "10", 3: "12-15", 4: "12/side", 5: "15" },
      restSeconds: 45,
      notes: "Control the movement",
    },
    {
      slotName: "Core B",
      slotType: "rotating",
      exercisesByWeek: { 1: "cable-crunch", 2: "plank", 3: "cable-crunch", 4: "cable-crunch", 5: "plank" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "15-20", 2: "45 sec", 3: "15-20", 4: "15-20", 5: "60 sec" },
      restSeconds: 45,
      notes: "Round the back, squeeze core",
    },
  ],
};

// ===== WEDNESDAY: Total Body / Legs =====
const wednesday: DayTemplate = {
  dayLabel: "Total Body & Legs",
  dayTheme: "lower-total",
  dayOfWeek: 3,
  slots: [
    {
      slotName: "Squat Pattern",
      slotType: "rotating",
      exercisesByWeek: { 1: "back-squat", 2: "hack-squat", 3: "back-squat", 4: "back-squat", 5: "hack-squat" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "10-12", 3: "10-12", 4: "8-10", 5: "10-12" },
      restSeconds: 120,
      notes: "Full depth, brace core",
    },
    {
      slotName: "Hip Hinge",
      slotType: "rotating",
      exercisesByWeek: { 1: "rdl", 2: "rdl", 3: "hip-thrust", 4: "rdl", 5: "hip-thrust" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "10", 2: "12", 3: "12", 4: "10", 5: "12" },
      restSeconds: 90,
      notes: "Hinge at hips / squeeze glutes",
    },
    {
      slotName: "Single Leg",
      slotType: "rotating",
      exercisesByWeek: { 1: "bulgarian-split", 2: "walking-lunge", 3: "bulgarian-split", 4: "walking-lunge", 5: "bulgarian-split" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "10/side", 2: "12/side", 3: "12/side", 4: "10/side", 5: "12/side" },
      restSeconds: 60,
      notes: "Balance and stability",
    },
    {
      slotName: "Hamstring Isolation",
      slotType: "fixed",
      exercisesByWeek: fixed("lying-leg-curl"),
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12-15", 2: "15", 3: "15", 4: "12-15", 5: "15" },
      restSeconds: 60,
      notes: "Control eccentric, point toes",
    },
    {
      slotName: "Calves",
      slotType: "fixed",
      exercisesByWeek: fixed("calf-raise"),
      setsByWeek: PROG_4_ALL,
      repsByWeek: { 1: "15", 2: "15", 3: "20", 4: "15", 5: "20" },
      restSeconds: 45,
      notes: "Full stretch at bottom, pause at top",
    },
  ],
};

// ===== THURSDAY: Back Thickness & Rear Delts =====
const thursday: DayTemplate = {
  dayLabel: "Back Thickness & Rear Delts",
  dayTheme: "pull-horizontal",
  dayOfWeek: 4,
  slots: [
    {
      slotName: "Primary Row",
      slotType: "fixed",
      exercisesByWeek: fixed("barbell-row"),
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
      restSeconds: 120,
      notes: "Torso parallel to floor, drive elbows back",
    },
    {
      slotName: "Row Variation",
      slotType: "rotating",
      exercisesByWeek: { 1: "chest-supported-row", 2: "seated-cable-row", 3: "db-row", 4: "chest-supported-row", 5: "meadows-row" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "12", 3: "10-12", 4: "12", 5: "10-12" },
      restSeconds: 90,
      notes: "Squeeze shoulder blades together",
    },
    {
      slotName: "Traps",
      slotType: "rotating",
      exercisesByWeek: { 1: "db-shrug", 2: "barbell-shrug", 3: "db-shrug", 4: "barbell-shrug", 5: "db-shrug" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12-15", 2: "12-15", 3: "15", 4: "12-15", 5: "15" },
      restSeconds: 60,
      notes: "Squeeze at top, no rolling",
    },
    {
      slotName: "Rear Delt Primary",
      slotType: "fixed",
      exercisesByWeek: fixed("face-pull"),
      setsByWeek: PROG_4_ALL,
      repsByWeek: { 1: "15", 2: "15", 3: "15-20", 4: "15", 5: "15-20" },
      restSeconds: 45,
      notes: "External rotation focus",
    },
    {
      slotName: "Rear Delt Accessory",
      slotType: "rotating",
      exercisesByWeek: { 1: "rear-delt-fly", 2: "reverse-pec-deck", 3: "rear-delt-fly", 4: "reverse-pec-deck", 5: "rear-delt-fly" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "15", 2: "15", 3: "15", 4: "15", 5: "15" },
      restSeconds: 45,
      notes: "Pinkies out, feel the squeeze",
    },
    {
      slotName: "Finisher",
      slotType: "fixed",
      exercisesByWeek: fixed("incline-walk"),
      setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      repsByWeek: { 1: "15 min", 2: "15 min", 3: "20 min", 4: "15 min", 5: "20 min" },
      restSeconds: 0,
      notes: "Steady state cardio",
    },
  ],
};

// ===== FRIDAY: Arms + Upper Accessories =====
const friday: DayTemplate = {
  dayLabel: "Arms & Upper Accessories",
  dayTheme: "arms",
  dayOfWeek: 5,
  slots: [
    {
      slotName: "Tricep Compound",
      slotType: "rotating",
      exercisesByWeek: { 1: "close-grip-bench", 2: "dip", 3: "close-grip-bench", 4: "dip", 5: "close-grip-bench" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "8-12", 3: "10", 4: "8-12", 5: "10" },
      restSeconds: 90,
      notes: "Heavy compound to start",
    },
    {
      slotName: "Bicep Long Head",
      slotType: "rotating",
      exercisesByWeek: { 1: "incline-db-curl", 2: "cable-curl", 3: "incline-db-curl", 4: "spider-curl", 5: "incline-db-curl" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "12", 3: "12", 4: "10-12", 5: "12" },
      restSeconds: 60,
      notes: "Full stretch on long head",
    },
    {
      slotName: "Tricep Isolation",
      slotType: "rotating",
      exercisesByWeek: { 1: "overhead-tricep", 2: "rope-pushdown", 3: "tricep-kickback", 4: "overhead-tricep", 5: "rope-pushdown" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "15", 3: "15", 4: "12", 5: "15" },
      restSeconds: 45,
      notes: "Cable or dumbbell",
    },
    {
      slotName: "Bicep Short Head",
      slotType: "rotating",
      exercisesByWeek: { 1: "preacher-curl", 2: "concentration-curl", 3: "preacher-curl", 4: "cable-curl", 5: "preacher-curl" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "12", 3: "12", 4: "12", 5: "12" },
      restSeconds: 60,
      notes: "Isolation, feel the peak contraction",
    },
    {
      slotName: "Forearms",
      slotType: "rotating",
      exercisesByWeek: { 1: "reverse-curl", 2: "wrist-curl", 3: "reverse-curl", 4: "wrist-curl", 5: "reverse-curl" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12-15", 2: "15", 3: "12-15", 4: "15", 5: "12-15" },
      restSeconds: 45,
      notes: "Burnout finisher for forearms",
    },
    {
      slotName: "Upper Chest",
      slotType: "rotating",
      exercisesByWeek: { 1: "incline-db-press", 2: "cable-fly", 3: "incline-db-press", 4: "cable-fly", 5: "incline-db-press" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "15", 3: "12", 4: "15", 5: "12" },
      restSeconds: 60,
      notes: "Upper body finishing touch",
    },
  ],
};

// ===== SATURDAY: Full Body Power =====
const saturday: DayTemplate = {
  dayLabel: "Full Body Power",
  dayTheme: "full-body",
  dayOfWeek: 6,
  slots: [
    {
      slotName: "Squat Pattern",
      slotType: "rotating",
      exercisesByWeek: { 1: "back-squat", 2: "hack-squat", 3: "back-squat", 4: "hack-squat", 5: "back-squat" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "10-12", 3: "10-12", 4: "8-10", 5: "10-12" },
      restSeconds: 120,
      notes: "Full depth, brace core",
    },
    {
      slotName: "Upper Push",
      slotType: "rotating",
      exercisesByWeek: { 1: "db-overhead-press", 2: "incline-db-press", 3: "db-overhead-press", 4: "incline-db-press", 5: "db-overhead-press" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "10-12", 3: "10-12", 4: "8-10", 5: "10-12" },
      restSeconds: 90,
      notes: "Core tight, full range of motion",
    },
    {
      slotName: "Upper Pull",
      slotType: "rotating",
      exercisesByWeek: { 1: "barbell-row", 2: "chest-supported-row", 3: "barbell-row", 4: "seated-cable-row", 5: "barbell-row" },
      setsByWeek: PROG_3_TO_4,
      repsByWeek: { 1: "8-10", 2: "12", 3: "10-12", 4: "12", 5: "10-12" },
      restSeconds: 90,
      notes: "Squeeze shoulder blades, drive elbows back",
    },
    {
      slotName: "Hip Hinge",
      slotType: "rotating",
      exercisesByWeek: { 1: "rdl", 2: "hip-thrust", 3: "rdl", 4: "hip-thrust", 5: "rdl" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "10", 2: "12", 3: "12", 4: "10", 5: "12" },
      restSeconds: 90,
      notes: "Hinge at hips / squeeze glutes at top",
    },
    {
      slotName: "Core",
      slotType: "rotating",
      exercisesByWeek: { 1: "hanging-leg-raise", 2: "plank", 3: "cable-crunch", 4: "hanging-leg-raise", 5: "ab-wheel" },
      setsByWeek: PROG_3_ALL,
      repsByWeek: { 1: "12", 2: "45 sec", 3: "15-20", 4: "15", 5: "10" },
      restSeconds: 45,
      notes: "Control the movement, brace hard",
    },
    {
      slotName: "Cardio Finisher",
      slotType: "fixed",
      exercisesByWeek: fixed("incline-walk"),
      setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
      repsByWeek: { 1: "15 min", 2: "15 min", 3: "20 min", 4: "15 min", 5: "20 min" },
      restSeconds: 0,
      notes: "Steady state, zone 2 heart rate",
    },
  ],
};

export const weeklyTemplate: DayTemplate[] = [
  sunday,
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
];

// Generate TemplateExercise[] for a given day and week
export function getExercisesForDayWeek(
  day: DayTemplate,
  week: number
): TemplateExercise[] {
  return day.slots.map((slot, idx) => ({
    exerciseId: slot.exercisesByWeek[week],
    order: idx + 1,
    targetSets: slot.setsByWeek[week],
    targetReps: slot.repsByWeek[week],
    restSeconds: slot.restSeconds,
    notes: slot.notes,
    slotType: slot.slotType,
    slotName: slot.slotName,
  }));
}
