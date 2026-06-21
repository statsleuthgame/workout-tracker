import { getSupabase } from "./supabase";
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
  const supabase = getSupabase();
  if (!supabase) return;
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

    // Push in dependency order so set_logs never reach the cloud before the
    // workout_logs they reference.
    const TABLE_ORDER = ["workoutLogs", "setLogs", "bodyMetrics"];
    for (const tableName of TABLE_ORDER) {
      const records = byTable.get(tableName);
      if (!records || records.length === 0) continue;
      const pgTable = TABLE_NAMES[tableName];
      if (!pgTable) continue;

      // Collapse duplicate ids within this batch (keep latest), but track every
      // queueId so all duplicates clear on a successful push. A single upsert
      // statement that touches the same id twice raises a Postgres cardinality
      // error and would otherwise wedge this table's queue forever.
      const latestById = new Map<string, Record<string, unknown>>();
      const batchQueueIds: number[] = [];
      for (const r of records) {
        batchQueueIds.push(r.queueId);
        const id = (r.data as { id?: string }).id;
        if (id != null) latestById.set(id, r.data);
      }

      const mapped = Array.from(latestById.values()).map((d) => toSnakeCase(tableName, d));
      if (mapped.length === 0) {
        processedIds.push(...batchQueueIds);
        continue;
      }

      const { error } = await supabase.from(pgTable).upsert(mapped, { onConflict: "id" });

      if (!error) {
        processedIds.push(...batchQueueIds);
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
