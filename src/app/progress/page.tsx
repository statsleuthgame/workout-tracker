"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Card } from "@/components/ui/card";
import { useWorkoutLogs, useBodyMetrics } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import { formatDate } from "@/lib/utils/dates";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { CHART_COLORS } from "@/lib/constants/chart-colors";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function ProgressPage() {
  const workoutLogs = useWorkoutLogs();
  const bodyMetrics = useBodyMetrics();

  const completedWorkouts =
    workoutLogs?.filter((w) => w.completedAt) || [];

  // Calculate weekly volume (total sets completed per week)
  const weeklyVolume = useLiveQuery(async () => {
    const allSets = await db.setLogs.toArray();
    const completed = allSets.filter((s) => s.completed);
    const allLogs = await db.workoutLogs.toArray();

    const logDateMap = new Map<string, string>();
    allLogs.forEach((log) => logDateMap.set(log.id, log.date));

    const byWeek = new Map<string, number>();
    completed.forEach((set) => {
      const date = logDateMap.get(set.workoutLogId);
      if (!date) return;
      const d = new Date(date + "T12:00:00");
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      byWeek.set(key, (byWeek.get(key) || 0) + 1);
    });

    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, sets]) => ({
        week: formatDate(week),
        sets,
      }));
  });

  // Exercise-specific progress (top exercises by frequency)
  const exerciseProgress = useLiveQuery(async () => {
    const allSets = await db.setLogs.toArray();
    const completed = allSets.filter(
      (s) => s.completed && s.actualWeight
    );

    const byExercise = new Map<string, { weight: number; date: string }[]>();
    const allLogs = await db.workoutLogs.toArray();
    const logDateMap = new Map<string, string>();
    allLogs.forEach((log) => logDateMap.set(log.id, log.date));

    completed.forEach((set) => {
      const date = logDateMap.get(set.workoutLogId) || "";
      const existing = byExercise.get(set.exerciseId) || [];
      existing.push({ weight: set.actualWeight!, date });
      byExercise.set(set.exerciseId, existing);
    });

    const exercises = await db.exercises.toArray();
    const nameMap = new Map<string, string>();
    exercises.forEach((e) => nameMap.set(e.id, e.name));

    return Array.from(byExercise.entries())
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 5)
      .map(([id, data]) => ({
        name: nameMap.get(id) || id,
        data: data
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((d) => ({
            date: formatDate(d.date),
            weight: d.weight,
          })),
      }));
  });

  const weightData =
    bodyMetrics?.map((m) => ({
      date: formatDate(m.date),
      weight: m.weight,
    })) || [];

  const streak = calculateStreak(completedWorkouts.map((w) => w.date));

  return (
    <div className="space-y-4 px-4 pt-6">
      <PageHeader title="Progress" subtitle="Track your gains over time" />

      {/* Stats Summary */}
      <div className="flex gap-3">
        <StatCard label="Workouts" value={completedWorkouts.length} />
        <StatCard
          label="This Week"
          value={
            completedWorkouts.filter((w) => {
              const d = new Date(w.date);
              const now = new Date();
              const diff = now.getTime() - d.getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length
          }
        />
        <StatCard label="Streak" value={streak}>
          {streak >= 3 && (
            <span className="text-lg" role="img" aria-label="fire">
              🔥
            </span>
          )}
        </StatCard>
      </div>

      {/* Body Weight Trend */}
      {weightData.length > 1 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Body Weight</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                width={40}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.success, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Weekly Volume */}
      {weeklyVolume && weeklyVolume.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Weekly Volume (Sets)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} width={30} />
              <Tooltip />
              <Bar dataKey="sets" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Exercise Progress Charts */}
      {exerciseProgress &&
        exerciseProgress.map((ex) => (
          <Card key={ex.name} className="p-4">
            <h2 className="mb-3 text-sm font-semibold">{ex.name}</h2>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={ex.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  width={40}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={CHART_COLORS.warning}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.warning, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}

      {/* Empty State */}
      {completedWorkouts.length === 0 && (
        <Card className="px-4 py-8 text-center">
          <p className="text-lg font-semibold">The best graphs start somewhere</p>
          <p className="text-sm text-muted-foreground">
            Complete a workout and watch the data roll in.
          </p>
        </Card>
      )}
    </div>
  );
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    // Skip Sundays (rest day)
    if (checkDate.getDay() === 0) continue;
    if (sorted.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
