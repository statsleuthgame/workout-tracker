"use client";

import { useEffect, useState } from "react";
import { seedDatabase } from "@/lib/db/seed";
import { initSync } from "@/lib/sync/sync-init";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

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

  return <>{children}</>;
}
