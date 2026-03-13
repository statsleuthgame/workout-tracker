import { db } from "../db/database";

export async function enqueue(tableName: string, recordId: string, data: unknown) {
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
