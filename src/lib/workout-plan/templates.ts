import type { TemplateExercise } from "../db/database";

// Each day defines exercise slots. "fixed" = Anchor Lifts (same every week).
// "rotating" = Variety Options (2 of 3 rotate across weeks for variety).

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

// Variety rotation: 2 of 3 options per week
// Pattern: W1(A,B) W2(B,C) W3(A,C) W4(A,B) W5(B,C)
function variety2of3(a: string, b: string, c: string): [Record<number, string>, Record<number, string>] {
  return [
    { 1: a, 2: b, 3: a, 4: a, 5: b }, // Variety Slot 1
    { 1: b, 2: c, 3: c, 4: b, 5: c }, // Variety Slot 2
  ];
}

// ===== SUNDAY: Active Recovery =====
const sunday: DayTemplate = {
  dayLabel: "Active Recovery",
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
      notes: "Walking, stretching, or yoga",
    },
  ],
};

// ===== MONDAY: Pull (Back Focus) =====
const monday: DayTemplate = {
  dayLabel: "Pull (Back Focus)",
  dayTheme: "pull-back",
  dayOfWeek: 1,
  slots: (() => {
    const [v1, v2] = variety2of3("lat-pulldown-wide", "single-arm-lat-pulldown", "face-pull");
    return [
      // Anchor 1
      {
        slotName: "Anchor: Pull-Ups",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("pullup"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "6-8", 2: "8-10", 3: "8-10", 4: "6-8", 5: "8-10" },
        restSeconds: 120,
        notes: "Use assistance if needed. Full stretch at bottom.",
      },
      // Anchor 2
      {
        slotName: "Anchor: Barbell Rows",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("barbell-row"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 120,
        notes: "Torso parallel to floor, drive elbows back",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "10-12", 2: "12", 3: "12-15", 4: "10-12", 5: "12" },
        restSeconds: 90,
        notes: "Pick based on how joints feel",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12-15", 2: "15", 3: "15", 4: "12-15", 5: "15" },
        restSeconds: 60,
        notes: "Focus on mind-muscle connection",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("hanging-leg-raise"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "10", 2: "12", 3: "12-15", 4: "12", 5: "15" },
        restSeconds: 45,
        notes: "Control the eccentric, no swinging",
      },
      // Cardio
      {
        slotName: "Cardio: Incline Walk",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("incline-walk"),
        setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        repsByWeek: { 1: "30 min", 2: "30 min", 3: "30 min", 4: "30 min", 5: "30 min" },
        restSeconds: 0,
        notes: "Incline 10-15%, no holding handrails",
      },
    ];
  })(),
};

// ===== TUESDAY: Push (Chest/Shoulder) =====
const tuesday: DayTemplate = {
  dayLabel: "Push (Chest/Shoulder)",
  dayTheme: "push-chest",
  dayOfWeek: 2,
  slots: (() => {
    const [v1, v2] = variety2of3("lateral-raise", "cable-fly", "dip");
    return [
      // Anchor 1
      {
        slotName: "Anchor: Overhead Press",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("db-overhead-press"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 90,
        notes: "Core tight, neutral spine",
      },
      // Anchor 2
      {
        slotName: "Anchor: Incline DB Bench",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("incline-db-press"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 90,
        notes: "30-45 degree angle, full stretch at bottom",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12-15", 2: "12", 3: "15", 4: "12-15", 5: "12" },
        restSeconds: 60,
        notes: "Lighter weight, focus on form",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12", 2: "12-15", 3: "12-15", 4: "12", 5: "12-15" },
        restSeconds: 60,
        notes: "Squeeze and control",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("plank"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "30 sec", 2: "40 sec", 3: "45 sec", 4: "45 sec", 5: "60 sec" },
        restSeconds: 30,
        notes: "Weighted if possible. Squeeze everything tight.",
      },
    ];
  })(),
};

// ===== WEDNESDAY: Legs (Foundation) =====
const wednesday: DayTemplate = {
  dayLabel: "Legs (Foundation)",
  dayTheme: "legs-foundation",
  dayOfWeek: 3,
  slots: (() => {
    const [v1, v2] = variety2of3("leg-press", "walking-lunge", "calf-raise");
    return [
      // Anchor 1
      {
        slotName: "Anchor: Barbell Squats",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("back-squat"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 120,
        notes: "Full depth, brace core",
      },
      // Anchor 2
      {
        slotName: "Anchor: Romanian Deadlift",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("rdl"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 90,
        notes: "Hinge at hips, feel hamstring stretch",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "10-12", 2: "12", 3: "12-15", 4: "10-12", 5: "12" },
        restSeconds: 90,
        notes: "Based on how joints feel",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12", 2: "15", 3: "15", 4: "12", 5: "15" },
        restSeconds: 60,
        notes: "Lighter weight, higher reps",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("russian-twist"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "20", 2: "20", 3: "25", 4: "25", 5: "30" },
        restSeconds: 45,
        notes: "Rotate fully side to side, feet off ground",
      },
    ];
  })(),
};

// ===== THURSDAY: Pull (Back/Rear Delt) =====
const thursday: DayTemplate = {
  dayLabel: "Pull (Back/Rear Delt)",
  dayTheme: "pull-rear",
  dayOfWeek: 4,
  slots: (() => {
    const [v1, v2] = variety2of3("seated-cable-row", "reverse-pec-deck", "hammer-curl");
    return [
      // Anchor 1 (rotating between deadlift and rack pull)
      {
        slotName: "Anchor: Deadlift/Rack Pull",
        slotType: "rotating" as const,
        exercisesByWeek: { 1: "deadlift", 2: "rack-pull", 3: "deadlift", 4: "rack-pull", 5: "deadlift" },
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "5-6", 2: "6-8", 3: "5-6", 4: "6-8", 5: "5-6" },
        restSeconds: 150,
        notes: "Heavy compound — maintain perfect form",
      },
      // Anchor 2
      {
        slotName: "Anchor: Meadows Rows",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("meadows-row"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 90,
        notes: "Staggered stance, pull to hip",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12", 2: "15", 3: "12-15", 4: "12", 5: "15" },
        restSeconds: 60,
        notes: "Squeeze shoulder blades together",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12-15", 2: "12", 3: "12", 4: "12-15", 5: "12" },
        restSeconds: 60,
        notes: "Feel the squeeze, controlled reps",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("ab-wheel"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "8", 2: "10", 3: "10", 4: "12", 5: "12" },
        restSeconds: 45,
        notes: "Brace core hard, don't arch back",
      },
      // Cardio
      {
        slotName: "Cardio: Incline Walk",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("incline-walk"),
        setsByWeek: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
        repsByWeek: { 1: "25 min", 2: "25 min", 3: "25 min", 4: "25 min", 5: "25 min" },
        restSeconds: 0,
        notes: "Incline 10-15%, no holding handrails",
      },
    ];
  })(),
};

// ===== FRIDAY: Push (Shoulder/Chest) =====
const friday: DayTemplate = {
  dayLabel: "Push (Shoulder/Chest)",
  dayTheme: "push-shoulder",
  dayOfWeek: 5,
  slots: (() => {
    const [v1, v2] = variety2of3("chest-press-machine", "front-raise", "rope-pushdown");
    return [
      // Anchor 1
      {
        slotName: "Anchor: Flat Bench",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("flat-bench"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "6-8", 2: "8-10", 3: "8-10", 4: "6-8", 5: "8-10" },
        restSeconds: 120,
        notes: "Arch back slightly, feet flat, touch chest",
      },
      // Anchor 2
      {
        slotName: "Anchor: Arnold Press",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("arnold-press"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "8-10", 2: "10", 3: "10-12", 4: "8-10", 5: "10" },
        restSeconds: 90,
        notes: "Rotate palms as you press, full range",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "10-12", 2: "12-15", 3: "12", 4: "10-12", 5: "12-15" },
        restSeconds: 60,
        notes: "Lighter accessory work",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12-15", 2: "15", 3: "15", 4: "12-15", 5: "15" },
        restSeconds: 45,
        notes: "Burnout finisher",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("hollow-body-hold"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "20 sec", 2: "25 sec", 3: "30 sec", 4: "35 sec", 5: "40 sec" },
        restSeconds: 30,
        notes: "Lower back pressed to floor, arms overhead",
      },
    ];
  })(),
};

// ===== SATURDAY: Legs (Hypertrophy) =====
const saturday: DayTemplate = {
  dayLabel: "Legs (Hypertrophy)",
  dayTheme: "legs-hypertrophy",
  dayOfWeek: 6,
  slots: (() => {
    const [v1, v2] = variety2of3("goblet-squat", "leg-extension", "glute-bridge");
    return [
      // Anchor 1
      {
        slotName: "Anchor: Bulgarian Split Squats",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("bulgarian-split"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "10/side", 2: "10/side", 3: "12/side", 4: "10/side", 5: "12/side" },
        restSeconds: 90,
        notes: "Back foot on bench, torso upright",
      },
      // Anchor 2
      {
        slotName: "Anchor: Leg Curls",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("lying-leg-curl"),
        setsByWeek: PROG_3_TO_4,
        repsByWeek: { 1: "10-12", 2: "12", 3: "12-15", 4: "10-12", 5: "12-15" },
        restSeconds: 60,
        notes: "Control eccentric, point toes",
      },
      // Variety 1
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v1,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12", 2: "12-15", 3: "15", 4: "12", 5: "12-15" },
        restSeconds: 60,
        notes: "Lighter weight, feel the muscle",
      },
      // Variety 2
      {
        slotName: "Variety",
        slotType: "rotating" as const,
        exercisesByWeek: v2,
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "12-15", 2: "15", 3: "15", 4: "12-15", 5: "15" },
        restSeconds: 60,
        notes: "Higher reps, chase the pump",
      },
      // Core
      {
        slotName: "Core",
        slotType: "fixed" as const,
        exercisesByWeek: fixed("captains-chair"),
        setsByWeek: PROG_3_ALL,
        repsByWeek: { 1: "10", 2: "12", 3: "12-15", 4: "12", 5: "15" },
        restSeconds: 45,
        notes: "Curl pelvis up, control the descent",
      },
    ];
  })(),
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
