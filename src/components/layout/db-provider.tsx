"use client";

import { useEffect, useState } from "react";
import { seedDatabase } from "@/lib/db/seed";
import { initSync } from "@/lib/sync/sync-init";
import { forcePushAllData } from "@/lib/sync/sync-seed-push";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [forceSyncMsg, setForceSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Seeding is essential — the program/templates live here.
        await seedDatabase();
        // Sync is best-effort; never let a sync failure block the app.
        try {
          await initSync();
        } catch (err) {
          console.warn("[sync] init failed", err);
        }

        // One-time migration trigger: /today?forcesync=1 pushes ALL local data
        // to the cloud (for a device whose history never synced).
        if (
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("forcesync") === "1"
        ) {
          try {
            const r = await forcePushAllData();
            const msg = r.errors.length
              ? `Synced ${r.workouts} workouts, ${r.sets} sets, ${r.metrics} weigh-ins.\n\nErrors: ${r.errors.join("; ")}`
              : `✅ Synced ${r.workouts} workouts, ${r.sets} sets, ${r.metrics} weigh-ins to the cloud.\n\nYou can close this and tell Cody it's done.`;
            if (mounted) setForceSyncMsg(msg);
          } catch (err) {
            if (mounted) setForceSyncMsg(`Force sync failed: ${String(err)}`);
          }
        }

        if (mounted) setStatus("ready");
      } catch (err) {
        console.error("[db] initialization failed", err);
        if (mounted) setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6">
        <div className="text-center max-w-xs">
          <p className="text-lg font-bold">Something went wrong</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t load your workout data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-2xl btn-gradient-primary px-6 py-3 text-sm font-bold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {forceSyncMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl border border-border">
            <p className="whitespace-pre-line text-sm font-medium text-foreground">
              {forceSyncMsg}
            </p>
            <button
              onClick={() => setForceSyncMsg(null)}
              className="mt-5 rounded-2xl btn-gradient-primary px-6 py-3 text-sm font-bold active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
