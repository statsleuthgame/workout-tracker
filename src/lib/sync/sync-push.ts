import { supabase } from "./supabase";
import { dequeueAll, removeProcessed } from "./sync-queue";

// camelCase to snake_case field mapping per table
type FieldMap = Record<string, string>;

const FIELD_MAPS: Record<string, FieldMap> = {
  workoutLogs: {
    id: "id",
    templateId: "template_id",
    date: "date",
    startedAt: "started_at",
    completedAt: "completed_at",
    notes: "notes",
  },
  setLogs: {
    id: "id",
    workoutLogId: "workout_log_id",
    exerciseId: "exercise_id",
    setNumber: "set_number",
    targetReps: "target_reps",
    actualReps: "actual_reps",
    targetWeight: "target_weight",
    actualWeight: "actual_weight",
    completed: "completed",
    completedAt: "completed_at",
  },
  bodyMetrics: {
    id: "id",
    date: "date",
    weight: "weight",
    notes: "notes",
  },
};

const TABLE_NAMES: Record<string, string> = {
  workoutLogs: "workout_logs",
  setLogs: "set_logs",
  bodyMetrics: "body_metrics",
};

function toSnakeCase(tableName: string, data: Record<string, unknown>): Record<string, unknown> {
  const map = FIELD_MAPS[tableName];
  if (!map) return data;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = map[key];
    if (snakeKey) {
      result[snakeKey] = value;
    }
  }
  return result;
}

let pushing = false;

export async function pushPendingChanges() {
  if (pushing || !navigator.onLine) return;
  pushing = true;

  try {
    const items = await dequeueAll();
    if (items.length === 0) return;

    // Group by table
    const byTable = new Map<string, { queueId: number; data: Record<string, unknown> }[]>();
    for (const item of items) {
      const group = byTable.get(item.tableName) || [];
      group.push({ queueId: item.queueId!, data: item.data as Record<string, unknown> });
      byTable.set(item.tableName, group);
    }

    const processedIds: number[] = [];

    for (const [tableName, records] of byTable) {
      const pgTable = TABLE_NAMES[tableName];
      if (!pgTable) continue;

      const mapped = records.map((r) => toSnakeCase(tableName, r.data));

      const { error } = await supabase.from(pgTable).upsert(mapped, { onConflict: "id" });

      if (!error) {
        processedIds.push(...records.map((r) => r.queueId));
      } else {
        console.warn(`[sync] Failed to push ${tableName}:`, error.message);
      }
    }

    if (processedIds.length > 0) {
      await removeProcessed(processedIds);
    }
  } catch (err) {
    console.warn("[sync] Push error:", err);
  } finally {
    pushing = false;
  }
}

export function startSyncPusher() {
  // Push every 10 seconds
  setInterval(pushPendingChanges, 10_000);

  // Push immediately when coming online
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      pushPendingChanges();
    });
  }

  // Initial push for any queued items
  pushPendingChanges();
}
