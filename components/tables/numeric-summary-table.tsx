import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/analysis/helpers";
import type { NumericSummary } from "@/lib/analysis/types";

interface NumericSummaryTableProps {
  summaries: NumericSummary[];
}

export function NumericSummaryTable({ summaries }: NumericSummaryTableProps) {
  if (summaries.length === 0) {
    return (
      <Card title="Sayısal Özet" description="Sayısal kolon tespit edilmedi.">
        <p className="text-sm text-slate-600">
          Dosyada sayısal bir kolon bulunamadığı için bu bölüm boş görünüyor.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Sayısal Özet" description="Count, min, max, mean, median, std. deviation">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-3 pr-4 font-medium">Kolon</th>
              <th className="px-3 py-3 font-medium">Count</th>
              <th className="px-3 py-3 font-medium">Min</th>
              <th className="px-3 py-3 font-medium">Max</th>
              <th className="px-3 py-3 font-medium">Mean</th>
              <th className="px-3 py-3 font-medium">Median</th>
              <th className="px-3 py-3 font-medium">Std Dev</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.name} className="border-b border-slate-100 text-slate-700">
                <td className="max-w-52 truncate py-3 pr-4 font-medium text-slate-900">{summary.name}</td>
                <td className="px-3 py-3">{formatNumber(summary.count, 0)}</td>
                <td className="px-3 py-3">{formatNumber(summary.min, 2)}</td>
                <td className="px-3 py-3">{formatNumber(summary.max, 2)}</td>
                <td className="px-3 py-3">{formatNumber(summary.mean, 2)}</td>
                <td className="px-3 py-3">{formatNumber(summary.median, 2)}</td>
                <td className="px-3 py-3">{formatNumber(summary.stdDev, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
