import type { ColumnSummary, ColumnType } from "@/lib/analysis/types";
import { formatNumber } from "@/lib/analysis/helpers";

import { Card } from "@/components/ui/card";

interface ColumnAnalysisTableProps {
  columns: ColumnSummary[];
}

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

export function ColumnAnalysisTable({ columns }: ColumnAnalysisTableProps) {
  return (
    <Card
      title="Kolon Analizi"
      description="Her kolon için doluluk, unique ve tip bilgisi"
      className="overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-3 pr-4 font-medium">Kolon</th>
              <th className="px-3 py-3 font-medium">Tip</th>
              <th className="px-3 py-3 font-medium">Dolu</th>
              <th className="px-3 py-3 font-medium">Boş</th>
              <th className="px-3 py-3 font-medium">Boş %</th>
              <th className="px-3 py-3 font-medium">Unique</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column) => (
              <tr key={column.name} className="border-b border-slate-100 text-slate-700">
                <td className="max-w-52 truncate py-3 pr-4 font-medium text-slate-900">{column.name}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${typeClassMap[column.type]}`}
                  >
                    {typeLabelMap[column.type]}
                  </span>
                </td>
                <td className="px-3 py-3">{formatNumber(column.nonMissingCount, 0)}</td>
                <td className="px-3 py-3">{formatNumber(column.missingCount, 0)}</td>
                <td className="w-52 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-cyan-500"
                        style={{ width: `${Math.min(100, column.missingPercentage)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-xs font-medium text-slate-600">
                      %{formatNumber(column.missingPercentage, 1)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">{formatNumber(column.uniqueCount, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
