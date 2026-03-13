"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkoutLogs } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import { formatDate } from "@/lib/utils/dates";
import { useLiveQuery } from "dexie-react-hooks";

export default function HistoryPage() {
  const workoutLogs = useWorkoutLogs();

  // Enrich logs with template data
  const enrichedLogs = useLiveQuery(async () => {
    if (!workoutLogs) return [];
    const templates = await db.workoutTemplates.toArray();
    const templateMap = new Map(templates.map((t) => [t.id, t]));

    return workoutLogs.map((log) => ({
      ...log,
      template: templateMap.get(log.templateId),
    }));
  }, [workoutLogs]);

  // Get set counts per workout log
  const setCounts = useLiveQuery(async () => {
    if (!workoutLogs) return new Map<string, { completed: number; total: number }>();
    const allSets = await db.setLogs.toArray();
    const counts = new Map<string, { completed: number; total: number }>();

    for (const log of workoutLogs) {
      const logSets = allSets.filter((s) => s.workoutLogId === log.id);
      counts.set(log.id, {
        completed: logSets.filter((s) => s.completed).length,
        total: logSets.length,
      });
    }
    return counts;
  }, [workoutLogs]);

  return (
    <div className="space-y-4 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">Workout History</h1>
        <p className="text-sm text-muted-foreground">
          Every workout you&apos;ve completed
        </p>
      </div>

      {enrichedLogs && enrichedLogs.length > 0 ? (
        <div className="space-y-2">
          {enrichedLogs.map((log) => {
            const counts = setCounts?.get(log.id);
            const isCompleted = !!log.completedAt;

            return (
              <Card key={log.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">
                        {log.template?.dayLabel || "Workout"}
                      </h3>
                      {isCompleted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.date)}
                      {log.template && ` · Week ${log.template.weekNumber}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {counts && counts.total > 0 && (
                      <p className="text-sm font-medium">
                        {counts.completed}/{counts.total} sets
                      </p>
                    )}
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-1.5 text-xs text-muted-foreground italic">
                    &quot;{log.notes}&quot;
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="px-4 py-8 text-center">
          <p className="text-lg font-semibold">No history yet</p>
          <p className="text-sm text-muted-foreground">
            Start a workout and it will show up here!
          </p>
        </Card>
      )}
    </div>
  );
}
