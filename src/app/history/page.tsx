"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkoutLogs } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import { formatDate } from "@/lib/utils/dates";
import { useLiveQuery } from "dexie-react-hooks";
import { PageHeader } from "@/components/common/page-header";
import { History } from "lucide-react";

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

  // Get set counts per workout log — use indexed query instead of full table scan
  const setCounts = useLiveQuery(async () => {
    if (!workoutLogs || workoutLogs.length === 0)
      return new Map<string, { completed: number; total: number }>();
    const logIds = workoutLogs.map((l) => l.id);
    const allSets = await db.setLogs
      .where("workoutLogId")
      .anyOf(logIds)
      .toArray();
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
      <PageHeader
        title="Workout History"
        subtitle="Every workout you've completed"
      />

      {enrichedLogs && enrichedLogs.length > 0 ? (
        <div className="space-y-2">
          {enrichedLogs.map((log) => {
            const counts = setCounts?.get(log.id);
            const isCompleted = !!log.completedAt;

            return (
              <Card key={log.id} className="px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">
                        {log.template?.dayLabel || "Workout"}
                      </h3>
                      {isCompleted ? (
                        <Badge className="bg-success-muted text-success hover:bg-success-muted text-[10px]">
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
        <Card className="px-4 py-10 text-center">
          <History className="mx-auto h-16 w-16 text-muted-foreground/20" />
          <p className="mt-3 text-xl font-extrabold gradient-text">Your story starts today</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every rep, every set, every workout — it all adds up.
          </p>
        </Card>
      )}
    </div>
  );
}
