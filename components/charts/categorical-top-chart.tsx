"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import type { CategoricalSummary } from "@/lib/analysis/types";

interface CategoricalTopChartProps {
  summaries: CategoricalSummary[];
}

function truncateLabel(value: string, maxLength = 14): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function CategoricalTopChart({ summaries }: CategoricalTopChartProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const activeColumn =
    summaries.find((summary) => summary.name === selectedColumn)?.name ??
    summaries[0]?.name ??
    "";

  const activeSummary = useMemo(
    () => summaries.find((summary) => summary.name === activeColumn) ?? summaries[0],
    [activeColumn, summaries],
  );

  const chartData =
    activeSummary?.topValues.map((value) => ({
      value: value.value,
      shortValue: truncateLabel(value.value),
      count: value.count,
    })) ?? [];

  return (
    <Card
      title="Kategorik Frekans"
      description="Seçilen kategorik kolon için en sık değerler"
      action={
        summaries.length > 0 ? (
          <select
            value={activeColumn}
            onChange={(event) => setSelectedColumn(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none ring-cyan-300 focus:ring"
          >
            {summaries.map((summary) => (
              <option key={summary.name} value={summary.name}>
                {summary.name}
              </option>
            ))}
          </select>
        ) : null
      }
      className="h-[360px]"
    >
      {activeSummary ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="shortValue" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value ?? 0);
                return [numericValue, "Adet"];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.value ?? ""}
            />
            <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-slate-600">Kategorik kolon bulunamadı.</p>
      )}
    </Card>
  );
}
