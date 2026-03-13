"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useBodyMetrics } from "@/lib/db/hooks";
import { db } from "@/lib/db/database";
import { getDateString, formatDate } from "@/lib/utils/dates";
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
} from "recharts";

export default function WeightLogPage() {
  const metrics = useBodyMetrics();
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const handleLog = async () => {
    if (!weight) return;
    const dateStr = getDateString();
    const id = `metric-${dateStr}`;

    await db.bodyMetrics.put({
      id,
      date: dateStr,
      weight: parseFloat(weight),
      notes: notes || undefined,
    });

    setWeight("");
    setNotes("");
  };

  const chartData =
    metrics?.map((m) => ({
      date: formatDate(m.date),
      weight: m.weight,
    })) || [];

  const latestWeight = metrics?.length
    ? metrics[metrics.length - 1].weight
    : null;
  const firstWeight = metrics?.length ? metrics[0].weight : null;
  const weightChange =
    latestWeight && firstWeight ? latestWeight - firstWeight : null;

  return (
    <div className="space-y-4 px-4 pt-6">
      <PageHeader title="Weight Log" subtitle="Track your weight loss progress" />

      {/* Summary Cards */}
      {metrics && metrics.length > 0 && (
        <div className="flex gap-3">
          <StatCard label="Current" value={`${latestWeight} lbs`} />
          <StatCard
            label="Change"
            value={
              weightChange !== null
                ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lbs`
                : "-"
            }
            className={
              weightChange && weightChange < 0
                ? "text-success"
                : weightChange && weightChange > 0
                ? "text-destructive"
                : ""
            }
          />
          <StatCard label="Entries" value={metrics.length} />
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Weight Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
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
                dot={{ fill: CHART_COLORS.success, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Log Input */}
      <Card className="space-y-3 p-4">
        <h2 className="text-sm font-semibold">Log Today&apos;s Weight</h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleLog}
            disabled={!weight}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 active:bg-primary/90"
          >
            Log
          </button>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </Card>

      {/* History */}
      {metrics && metrics.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">History</h2>
          {[...metrics].reverse().map((m) => (
            <Card
              key={m.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{formatDate(m.date)}</p>
                {m.notes && (
                  <p className="text-xs text-muted-foreground">{m.notes}</p>
                )}
              </div>
              <p className="text-lg font-bold">{m.weight} lbs</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
