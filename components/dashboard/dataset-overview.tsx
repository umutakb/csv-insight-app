import { BarChart3, Database, Table2, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/analysis/helpers";
import type { CsvAnalysisResult } from "@/lib/analysis/types";

interface DatasetOverviewProps {
  analysis: CsvAnalysisResult;
}

export function DatasetOverview({ analysis }: DatasetOverviewProps) {
  const typeCounts = analysis.columnSummaries.reduce(
    (acc, column) => {
      acc[column.type] = (acc[column.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const averageMissingRate =
    analysis.columnSummaries.length === 0
      ? 0
      : analysis.columnSummaries.reduce((sum, column) => sum + column.missingPercentage, 0) /
        analysis.columnSummaries.length;

  const cards = [
    {
      title: "Satır Sayısı",
      value: formatNumber(analysis.dataset.rowCount, 0),
      icon: Database,
      subtitle: "Toplam kayıt",
    },
    {
      title: "Kolon Sayısı",
      value: formatNumber(analysis.dataset.columnCount, 0),
      icon: Table2,
      subtitle: "Başlık sütunu",
    },
    {
      title: "Ortalama Eksik Oranı",
      value: `%${formatNumber(averageMissingRate, 1)}`,
      icon: TriangleAlert,
      subtitle: "Kolon bazlı ortalama",
    },
    {
      title: "Sayısal / Kategorik",
      value: `${typeCounts.numeric ?? 0} / ${(typeCounts.categorical ?? 0) + (typeCounts.boolean ?? 0)}`,
      icon: BarChart3,
      subtitle: "Analize uygun alanlar",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
