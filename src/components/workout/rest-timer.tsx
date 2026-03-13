"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";

export function RestTimer() {
  const { timerActive, timerSeconds, timerTotal, tick, stopTimer } =
    useAppStore();

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerActive, tick]);

  // Vibrate when timer ends
  useEffect(() => {
    if (timerActive && timerSeconds === 0 && timerTotal > 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [timerActive, timerSeconds, timerTotal]);

  if (!timerActive) return null;

  const progress = timerTotal > 0 ? (timerSeconds / timerTotal) * 100 : 0;
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium opacity-80">Rest Timer</p>
              <p className="text-2xl font-bold tabular-nums">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
            </div>
          </div>
          <button
            onClick={stopTimer}
            className="rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary-foreground/30"
          >
            Skip
          </button>
        </div>
        <div className="h-1 w-full bg-primary-foreground/20">
          <div
            className="h-full bg-primary-foreground/60 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
