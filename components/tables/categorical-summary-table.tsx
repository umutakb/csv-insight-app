import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/analysis/helpers";
import type { CategoricalSummary } from "@/lib/analysis/types";

interface CategoricalSummaryTableProps {
  summaries: CategoricalSummary[];
}

export function CategoricalSummaryTable({ summaries }: CategoricalSummaryTableProps) {
  if (summaries.length === 0) {
    return (
      <Card title="Kategorik Özet" description="Kategorik kolon tespit edilmedi.">
        <p className="text-sm text-slate-600">
          Dosyada kategorik veya boolean kolon bulunamadığı için bu bölüm boş görünüyor.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Kategorik Özet" description="Unique count ve en sık 5 değer">
      <div className="space-y-4">
        {summaries.map((summary) => (
          <div key={summary.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{summary.name}</h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                Unique: {formatNumber(summary.uniqueCount, 0)}
              </span>
            </div>

            {summary.topValues.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {summary.topValues.map((entry) => (
                  <div
                    key={`${summary.name}-${entry.value}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <span className="max-w-44 truncate text-slate-700" title={entry.value}>
                      {entry.value}
                    </span>
                    <span className="font-semibold text-slate-900">{formatNumber(entry.count, 0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Bu kolonda dolu değer bulunmuyor.</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
