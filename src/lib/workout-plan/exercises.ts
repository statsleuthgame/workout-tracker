import type { Exercise } from "../db/database";

function yt(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " form tutorial")}`;
}

export const exerciseLibrary: Exercise[] = [
  // ===== BACK (VERTICAL / WIDTH) =====
  { id: "pullup", name: "Weighted Pull-Ups", muscleGroup: "back", equipment: "pullup bar", formCues: ["Full stretch at bottom", "Drive elbows down", "Chin over bar"], videoUrl: yt("weighted pull ups") },
  { id: "lat-pulldown-wide", name: "Wide Grip Lat Pulldown", muscleGroup: "back", equipment: "cable", formCues: ["Lean slightly back", "Pull to upper chest", "Squeeze lats at bottom"], videoUrl: yt("wide grip lat pulldown") },
  { id: "lat-pulldown-neutral", name: "Neutral Grip Lat Pulldown", muscleGroup: "back", equipment: "cable", formCues: ["Drive elbows to hip", "Full stretch at top", "Control the negative"], videoUrl: yt("neutral grip lat pulldown") },
  { id: "single-arm-lat-pulldown", name: "Single Arm Lat Pulldown", muscleGroup: "back", equipment: "cable", formCues: ["Drive elbow to hip", "Slight rotation at bottom", "Full stretch"], videoUrl: yt("single arm lat pulldown") },
  { id: "cable-pullover", name: "Cable Pullover", muscleGroup: "back", equipment: "cable", formCues: ["Keep arms straight", "Squeeze lats at bottom", "Slow eccentric"], videoUrl: yt("cable pullover back") },
  { id: "straight-arm-pulldown", name: "Straight Arm Pulldown", muscleGroup: "back", equipment: "cable", formCues: ["Keep arms straight", "Squeeze lats", "Hinge slightly forward"], videoUrl: yt("straight arm pulldown") },

  // ===== BACK (HORIZONTAL / THICKNESS) =====
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "back", equipment: "barbell", formCues: ["Torso parallel to floor", "Drive elbows back", "Squeeze at top"], videoUrl: yt("barbell row") },
  { id: "tbar-row", name: "T-Bar Row", muscleGroup: "back", equipment: "t-bar", formCues: ["Chest on pad if supported", "Pull to chest", "Squeeze shoulder blades"], videoUrl: yt("t-bar row") },
  { id: "chest-supported-row", name: "Chest Supported Row", muscleGroup: "back", equipment: "machine", formCues: ["Squeeze shoulder blades", "Chest against pad", "Full stretch at bottom"], videoUrl: yt("chest supported row") },
  { id: "seated-cable-row", name: "Seated Cable Row", muscleGroup: "back", equipment: "cable", formCues: ["Sit upright", "Pull to lower chest", "Squeeze shoulder blades"], videoUrl: yt("seated cable row") },
  { id: "db-row", name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbell", formCues: ["Flat back", "Pull to hip", "Squeeze at top"], videoUrl: yt("dumbbell row") },
  { id: "meadows-row", name: "Meadows Row", muscleGroup: "back", equipment: "barbell", formCues: ["Staggered stance", "Pull to hip", "Stretch at bottom"], videoUrl: yt("meadows row") },

  // ===== REAR DELTS =====
  { id: "face-pull", name: "Face Pulls", muscleGroup: "rear delts", equipment: "cable", formCues: ["External rotation focus", "Pull to forehead", "Squeeze rear delts"], videoUrl: yt("face pulls cable") },
  { id: "rear-delt-fly", name: "Rear Delt Fly", muscleGroup: "rear delts", equipment: "dumbbell", formCues: ["Pinkies out", "Slight bend in elbows", "Squeeze at top"], videoUrl: yt("rear delt fly dumbbell") },
  { id: "reverse-pec-deck", name: "Reverse Pec Deck", muscleGroup: "rear delts", equipment: "machine", formCues: ["Chest against pad", "Lead with elbows", "Control the negative"], videoUrl: yt("reverse pec deck") },

  // ===== TRAPS =====
  { id: "db-shrug", name: "Dumbbell Shrugs", muscleGroup: "traps", equipment: "dumbbell", formCues: ["Squeeze at top, no rolling", "Hold 2 seconds", "Full stretch at bottom"], videoUrl: yt("dumbbell shrugs") },
  { id: "barbell-shrug", name: "Barbell Shrugs", muscleGroup: "traps", equipment: "barbell", formCues: ["Squeeze at top, no rolling", "Hold pause at top", "Straight up and down"], videoUrl: yt("barbell shrugs") },

  // ===== SHOULDERS =====
  { id: "db-overhead-press", name: "Seated DB Overhead Press", muscleGroup: "shoulders", equipment: "dumbbell", formCues: ["Core tight, neutral spine", "Press slightly in front", "Full lockout"], videoUrl: yt("seated dumbbell overhead press") },
  { id: "lateral-raise", name: "Lateral Raises", muscleGroup: "shoulders", equipment: "dumbbell", formCues: ["Lead with elbows", "Slight forward lean", "Stop at shoulder height"], videoUrl: yt("lateral raises dumbbell") },
  { id: "cable-lateral-raise", name: "Cable Lateral Raises", muscleGroup: "shoulders", equipment: "cable", formCues: ["Lead with elbow", "Constant tension", "Control the negative"], videoUrl: yt("cable lateral raise") },
  { id: "machine-press", name: "Machine Shoulder Press", muscleGroup: "shoulders", equipment: "machine", formCues: ["Feet flat", "Press through full range", "Control descent"], videoUrl: yt("machine shoulder press") },

  // ===== TRICEPS =====
  { id: "skullcrusher", name: "Skullcrushers", muscleGroup: "triceps", equipment: "barbell", formCues: ["Keep elbows tucked", "Lower to forehead", "Full extension"], videoUrl: yt("skullcrushers") },
  { id: "rope-pushdown", name: "Tricep Rope Pushdown", muscleGroup: "triceps", equipment: "cable", formCues: ["Spread rope at bottom", "Elbows pinned to sides", "Squeeze at bottom"], videoUrl: yt("tricep rope pushdown") },
  { id: "overhead-tricep", name: "Overhead Tricep Extension", muscleGroup: "triceps", equipment: "cable", formCues: ["Cable or dumbbell", "Full stretch overhead", "Elbows close to ears"], videoUrl: yt("overhead tricep extension") },
  { id: "close-grip-bench", name: "Close Grip Bench Press", muscleGroup: "triceps", equipment: "barbell", formCues: ["Tricep focus", "Hands shoulder width", "Elbows tucked"], videoUrl: yt("close grip bench press") },
  { id: "tricep-kickback", name: "Tricep Kickback", muscleGroup: "triceps", equipment: "dumbbell", formCues: ["Keep elbow pinned", "Full extension", "Squeeze at top"], videoUrl: yt("tricep kickback dumbbell") },
  { id: "dip", name: "Dips (Tricep)", muscleGroup: "triceps", equipment: "bodyweight", formCues: ["Upright torso", "Elbows back, not flared", "Full lockout"], videoUrl: yt("tricep dips") },

  // ===== BICEPS =====
  { id: "ez-bar-curl", name: "EZ Bar Curls", muscleGroup: "biceps", equipment: "barbell", formCues: ["Strict form, no swinging", "Full range of motion", "Squeeze at top"], videoUrl: yt("ez bar curl") },
  { id: "hammer-curl", name: "Hammer Curls", muscleGroup: "biceps", equipment: "dumbbell", formCues: ["Focus on brachialis", "Neutral grip", "No swinging"], videoUrl: yt("hammer curls") },
  { id: "incline-db-curl", name: "Incline DB Curls", muscleGroup: "biceps", equipment: "dumbbell", formCues: ["Full stretch on long head", "Set bench 45 degrees", "Slow eccentric"], videoUrl: yt("incline dumbbell curl") },
  { id: "preacher-curl", name: "Preacher Curls", muscleGroup: "biceps", equipment: "dumbbell", formCues: ["Isolation", "Full stretch at bottom", "Don't swing"], videoUrl: yt("preacher curls") },
  { id: "spider-curl", name: "Spider Curls", muscleGroup: "biceps", equipment: "dumbbell", formCues: ["Chest on incline bench", "Gravity does the work", "Peak contraction"], videoUrl: yt("spider curls") },
  { id: "concentration-curl", name: "Concentration Curls", muscleGroup: "biceps", equipment: "dumbbell", formCues: ["Elbow on inner thigh", "Supinate at top", "Slow and controlled"], videoUrl: yt("concentration curls") },
  { id: "cable-curl", name: "Cable Curls", muscleGroup: "biceps", equipment: "cable", formCues: ["Constant tension", "Elbows pinned", "Squeeze at top"], videoUrl: yt("cable curls") },

  // ===== FOREARMS =====
  { id: "reverse-curl", name: "Reverse Curls", muscleGroup: "forearms", equipment: "barbell", formCues: ["Target the brachioradialis", "Overhand grip", "Control the weight"], videoUrl: yt("reverse curls") },
  { id: "wrist-curl", name: "Forearm Wrist Curls", muscleGroup: "forearms", equipment: "dumbbell", formCues: ["Burnout", "Rest forearms on thighs", "Full range"], videoUrl: yt("wrist curls") },

  // ===== CHEST =====
  { id: "incline-db-press", name: "Incline DB Press", muscleGroup: "chest", equipment: "dumbbell", formCues: ["30-45 degree angle", "Squeeze at top", "Full stretch at bottom"], videoUrl: yt("incline dumbbell press") },
  { id: "cable-fly", name: "Cable Flys", muscleGroup: "chest", equipment: "cable", formCues: ["Slight bend in elbows", "Squeeze at center", "Control the stretch"], videoUrl: yt("cable flys") },

  // ===== LEGS =====
  { id: "back-squat", name: "Back Squat", muscleGroup: "quads", equipment: "barbell", formCues: ["Full depth", "Knees over toes", "Brace core"], videoUrl: yt("barbell back squat") },
  { id: "hack-squat", name: "Hack Squat", muscleGroup: "quads", equipment: "machine", formCues: ["Full depth", "Feet shoulder width", "Control descent"], videoUrl: yt("hack squat machine") },
  { id: "rdl", name: "Romanian Deadlifts", muscleGroup: "hamstrings", equipment: "barbell", formCues: ["Hinge at hips", "Slight knee bend", "Feel hamstring stretch"], videoUrl: yt("romanian deadlift") },
  { id: "lying-leg-curl", name: "Lying Leg Curls", muscleGroup: "hamstrings", equipment: "machine", formCues: ["Control eccentric", "Point toes", "Full range"], videoUrl: yt("lying leg curl") },
  { id: "leg-extension", name: "Leg Extensions", muscleGroup: "quads", equipment: "machine", formCues: ["Hold at top for 1s", "Control descent", "Full extension"], videoUrl: yt("leg extensions") },
  { id: "calf-raise", name: "Seated Calf Raises", muscleGroup: "calves", equipment: "machine", formCues: ["Full stretch at bottom", "Pause at top", "Slow negative"], videoUrl: yt("seated calf raises") },
  { id: "leg-press", name: "Leg Press", muscleGroup: "quads", equipment: "machine", formCues: ["Feet high for glutes", "Full range", "Don't lock knees"], videoUrl: yt("leg press") },
  { id: "bulgarian-split", name: "Bulgarian Split Squat", muscleGroup: "quads", equipment: "dumbbell", formCues: ["Back foot on bench", "Torso upright", "Drive through front heel"], videoUrl: yt("bulgarian split squat") },
  { id: "hip-thrust", name: "Hip Thrust", muscleGroup: "glutes", equipment: "barbell", formCues: ["Squeeze glutes at top", "Chin tucked", "Pause at top"], videoUrl: yt("barbell hip thrust") },
  { id: "walking-lunge", name: "Walking Lunges", muscleGroup: "quads", equipment: "dumbbell", formCues: ["Long stride", "Knee tracks over toe", "Upright torso"], videoUrl: yt("walking lunges") },

  // ===== CORE =====
  { id: "hanging-leg-raise", name: "Hanging Leg Raises", muscleGroup: "core", equipment: "pullup bar", formCues: ["Control the eccentric", "No swinging", "Curl pelvis up"], videoUrl: yt("hanging leg raises") },
  { id: "cable-crunch", name: "Cable Crunches", muscleGroup: "core", equipment: "cable", formCues: ["Round the back, squeeze core", "Hinge at hips", "Control the weight"], videoUrl: yt("cable crunches") },
  { id: "plank", name: "Plank", muscleGroup: "core", equipment: "bodyweight", formCues: ["Squeeze everything tight", "Flat back", "Breathe steadily"], videoUrl: yt("plank exercise") },
  { id: "ab-wheel", name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "ab wheel", formCues: ["Brace core hard", "Don't arch back", "Controlled extension"], videoUrl: yt("ab wheel rollout") },
  { id: "pallof-press", name: "Pallof Press", muscleGroup: "core", equipment: "cable", formCues: ["Anti-rotation focus", "Press and hold", "Brace core"], videoUrl: yt("pallof press") },

  // ===== CARDIO =====
  { id: "incline-walk", name: "Incline Walk", muscleGroup: "cardio", equipment: "treadmill", formCues: ["Zone 2 heart rate", "No holding handrails", "Steady pace"], videoUrl: yt("incline treadmill walk") },
];
