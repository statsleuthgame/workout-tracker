import { registerSyncHooks } from "./sync-hooks";
import { pullFromCloud } from "./sync-pull";
import { startSyncPusher } from "./sync-push";
import { pushAllExistingData } from "./sync-seed-push";

let initialized = false;

export async function initSync() {
  if (initialized) return;
  initialized = true;

  // Skip sync if env vars not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[sync] Supabase not configured, skipping sync");
    return;
  }

  // 1. Register Dexie hooks to capture all future writes
  registerSyncHooks();

  // 2. If local DB was cleared, restore from cloud
  const restored = await pullFromCloud();

  // 3. If we didn't restore (local data exists), push any existing data that may not be in cloud yet
  if (!restored) {
    await pushAllExistingData();
  }

  // 4. Start background push loop
  startSyncPusher();
}
