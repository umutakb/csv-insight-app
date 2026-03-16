import type { ColumnType, CsvAnalysisResult } from "@/lib/analysis/types";

import { Card } from "@/components/ui/card";

const typeLabelMap: Record<ColumnType, string> = {
  numeric: "Numeric",
  categorical: "Categorical",
  boolean: "Boolean",
  "date-like": "Date-like",
  text: "Text",
};

const typeClassMap: Record<ColumnType, string> = {
  numeric: "bg-emerald-50 text-emerald-700 border-emerald-200",
  categorical: "bg-cyan-50 text-cyan-700 border-cyan-200",
  boolean: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "date-like": "bg-amber-50 text-amber-700 border-amber-200",
  text: "bg-slate-100 text-slate-700 border-slate-200",
};

interface ColumnsGlanceProps {
  analysis: CsvAnalysisResult;
}

export function ColumnsGlance({ analysis }: ColumnsGlanceProps) {
  return (
    <Card
      title="Kolonlar"
      description="Kolon isimleri ve tahmini tipler"
      className="overflow-hidden"
    >
      <div className="flex max-h-60 flex-wrap gap-2 overflow-auto pr-1">
        {analysis.columnSummaries.map((column) => (
          <div
            key={column.name}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5"
          >
            <span className="max-w-[14rem] truncate text-sm font-medium text-slate-800">{column.name}</span>
            <span
              className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${typeClassMap[column.type]}`}
            >
              {typeLabelMap[column.type]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
