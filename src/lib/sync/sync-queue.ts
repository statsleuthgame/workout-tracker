import { db } from "../db/database";

export async function enqueue(tableName: string, recordId: string, data: unknown) {
  // Collapse any pending entry for this record so the queue holds at most one
  // row per (table, record). Prevents unbounded queue growth and keeps a single
  // record from appearing multiple times in one push batch.
  await db.syncQueue
    .where("recordId")
    .equals(recordId)
    .and((i) => i.tableName === tableName)
    .delete();
  await db.syncQueue.put({
    tableName,
    recordId,
    data,
    createdAt: new Date().toISOString(),
  });
}

export async function dequeueAll() {
  return db.syncQueue.toArray();
}

export async function removeProcessed(queueIds: number[]) {
  await db.syncQueue.bulkDelete(queueIds);
}
