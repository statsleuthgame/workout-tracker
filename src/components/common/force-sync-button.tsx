"use client";

import { useState } from "react";
import { forcePushAllData } from "@/lib/sync/sync-seed-push";
import { UploadCloud } from "lucide-react";

// Temporary one-time migration control. Renders a small banner inside the app
// (so it runs in the home-screen PWA's own storage context, where the real
// history lives) that pushes all local data to the cloud on tap.
export function ForceSyncButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await forcePushAllData();
      setMsg(
        r.errors.length
          ? `Synced ${r.workouts} workouts, ${r.sets} sets, ${r.metrics} weigh-ins.\n\nErrors: ${r.errors.join("; ")}`
          : `✅ Synced ${r.workouts} workouts, ${r.sets} sets, ${r.metrics} weigh-ins to the cloud.\n\nTell Cody these numbers.`
      );
    } catch (err) {
      setMsg(`Sync failed: ${String(err)}`);
    }
    setBusy(false);
  };

  if (hidden) return null;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[90] flex justify-center px-3 pt-[env(safe-area-inset-top)]">
        <button
          onClick={run}
          disabled={busy}
          className="mt-2 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg active:scale-95 disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" />
          {busy ? "Syncing…" : "Migrate my data to the app"}
        </button>
      </div>

      {msg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl border border-border">
            <p className="whitespace-pre-line text-sm font-medium text-foreground">{msg}</p>
            <button
              onClick={() => {
                setMsg(null);
                setHidden(true);
              }}
              className="mt-5 rounded-2xl btn-gradient-primary px-6 py-3 text-sm font-bold active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
