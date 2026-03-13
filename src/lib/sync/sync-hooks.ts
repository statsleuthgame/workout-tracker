import { db } from "../db/database";
import { enqueue } from "./sync-queue";

export let isPulling = false;

export function setIsPulling(value: boolean) {
  isPulling = value;
}

export function registerSyncHooks() {
  const tables = ["workoutLogs", "setLogs", "bodyMetrics"] as const;

  for (const tableName of tables) {
    const table = db[tableName];

    table.hook("creating", function (_primKey, obj) {
      if (!isPulling) {
        enqueue(tableName, obj.id, obj);
      }
    });

    table.hook("updating", function (modifications, _primKey, obj) {
      if (!isPulling) {
        const updated = { ...obj, ...modifications };
        enqueue(tableName, updated.id, updated);
      }
    });
  }
}
