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
import type { NumericSummary } from "@/lib/analysis/types";

interface NumericDistributionChartProps {
  summaries: NumericSummary[];
}

export function NumericDistributionChart({ summaries }: NumericDistributionChartProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const activeColumn =
    summaries.find((summary) => summary.name === selectedColumn)?.name ??
    summaries[0]?.name ??
    "";

  const activeSummary = useMemo(
    () => summaries.find((summary) => summary.name === activeColumn) ?? summaries[0],
    [activeColumn, summaries],
  );

  return (
    <Card
      title="Sayısal Dağılım"
      description="Seçilen sayısal kolon için histogram"
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
          <BarChart data={activeSummary.histogram} margin={{ top: 8, right: 8, left: -20, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="range"
              angle={-30}
              textAnchor="end"
              height={62}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value ?? 0);
                return [numericValue, "Adet"];
              }}
            />
            <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-slate-600">Sayısal kolon bulunamadı.</p>
      )}
    </Card>
  );
}
