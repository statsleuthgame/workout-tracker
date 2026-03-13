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
        <Card className="p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight Trend</h2>
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
      <Card className="space-y-3 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Today&apos;s Weight</h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (lbs)"
            className="flex-1 rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-base outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleLog}
            disabled={!weight}
            className="rounded-2xl btn-gradient-primary px-6 py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Log
          </button>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-2xl border border-border/50 bg-background/50 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </Card>

      {/* History */}
      {metrics && metrics.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</h2>
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
