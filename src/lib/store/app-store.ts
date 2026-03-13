import { create } from "zustand";

interface AppState {
  // Active workout
  activeWorkoutLogId: string | null;
  setActiveWorkout: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeWorkoutLogId: null,
  setActiveWorkout: (id) => set({ activeWorkoutLogId: id }),
}));
