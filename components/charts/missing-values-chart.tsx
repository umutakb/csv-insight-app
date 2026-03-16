"use client";

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
import type { ColumnSummary } from "@/lib/analysis/types";

interface MissingValuesChartProps {
  columns: ColumnSummary[];
}

export function MissingValuesChart({ columns }: MissingValuesChartProps) {
  const chartData = [...columns]
    .sort((a, b) => b.missingPercentage - a.missingPercentage)
    .slice(0, 20)
    .map((column) => ({
      name: column.name,
      missing: Number(column.missingPercentage.toFixed(2)),
    }));

  return (
    <Card
      title="Eksik Değer Dağılımı"
      description="Kolonlara göre boş değer yüzdesi (ilk 20 kolon)"
      className="h-[360px]"
    >
      {chartData.length === 0 ? (
        <p className="text-sm text-slate-600">Grafik için kolon bulunamadı.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              height={72}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => {
                const numericValue =
                  typeof value === "number" ? value : Number(value ?? 0);
                return [`%${numericValue.toFixed(2)}`, "Eksik Oran"];
              }}
            />
            <Bar dataKey="missing" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
