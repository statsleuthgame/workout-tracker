import { create } from "zustand";

interface AppState {
  // Rest timer
  timerActive: boolean;
  timerSeconds: number;
  timerTotal: number;
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  tick: () => void;

  // Active workout
  activeWorkoutLogId: string | null;
  setActiveWorkout: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  timerActive: false,
  timerSeconds: 0,
  timerTotal: 0,
  startTimer: (seconds: number) =>
    set({ timerActive: true, timerSeconds: seconds, timerTotal: seconds }),
  stopTimer: () => set({ timerActive: false, timerSeconds: 0, timerTotal: 0 }),
  tick: () =>
    set((state) => {
      if (state.timerSeconds <= 1) {
        return { timerActive: false, timerSeconds: 0, timerTotal: 0 };
      }
      return { timerSeconds: state.timerSeconds - 1 };
    }),

  activeWorkoutLogId: null,
  setActiveWorkout: (id) => set({ activeWorkoutLogId: id }),
}));
