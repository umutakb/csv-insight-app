"use client";

import { Download, FileSpreadsheet, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoricalTopChart } from "@/components/charts/categorical-top-chart";
import { MissingValuesChart } from "@/components/charts/missing-values-chart";
import { NumericDistributionChart } from "@/components/charts/numeric-distribution-chart";
import { ColumnsGlance } from "@/components/dashboard/columns-glance";
import { DatasetOverview } from "@/components/dashboard/dataset-overview";
import { CategoricalSummaryTable } from "@/components/tables/categorical-summary-table";
import { ColumnAnalysisTable } from "@/components/tables/column-analysis-table";
import { DataPreviewTable } from "@/components/tables/data-preview-table";
import { NumericSummaryTable } from "@/components/tables/numeric-summary-table";
import { UploadZone } from "@/components/upload/upload-zone";
import { analyzeCsvText, parseAndAnalyzeCsvFile } from "@/lib/analysis/csv-analysis";
import { formatNumber } from "@/lib/analysis/helpers";
import type { CsvAnalysisResult } from "@/lib/analysis/types";

export function CsvInsightDashboard() {
  const [analysis, setAnalysis] = useState<CsvAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseAndAnalyzeCsvFile(file);
      setAnalysis(result);
    } catch (uploadError) {
      setAnalysis(null);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Dosya işlenirken beklenmeyen bir hata oluştu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/sample-data/ecommerce-orders.csv");
      if (!response.ok) {
        throw new Error("Örnek veri dosyası okunamadı.");
      }

      const text = await response.text();
      const result = analyzeCsvText(text, "ecommerce-orders.csv");
      setAnalysis(result);
    } catch (sampleError) {
      setAnalysis(null);
      setError(
        sampleError instanceof Error
          ? sampleError.message
          : "Örnek veri yüklenirken hata oluştu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredColumns = useMemo(() => {
    if (!analysis) {
      return [];
    }

    const keyword = searchText.trim().toLocaleLowerCase("tr");
    if (!keyword) {
      return analysis.columnSummaries;
    }

    return analysis.columnSummaries.filter((column) =>
      `${column.name} ${column.type}`.toLocaleLowerCase("tr").includes(keyword),
    );
  }, [analysis, searchText]);

  const handleDownloadSummary = () => {
    if (!analysis) {
      return;
    }

    const payload = {
      fileName: analysis.fileName,
      dataset: analysis.dataset,
      columnSummaries: analysis.columnSummaries,
      numericSummaries: analysis.numericSummaries.map((summary) => ({
        name: summary.name,
        count: summary.count,
        min: summary.min,
        max: summary.max,
        mean: summary.mean,
        median: summary.median,
        stdDev: summary.stdDev,
        histogram: summary.histogram,
      })),
      categoricalSummaries: analysis.categoricalSummaries,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${analysis.fileName.replace(/\.csv$/i, "")}-summary.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#f8fafc_35%,_#f1f5f9_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm shadow-slate-900/5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV Insight Dashboard
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                csv-insight-app
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                CSV dosyanı yükle, kolon tiplerini ve veri kalitesini anında gör, temel
                istatistikleri ve grafikleri tek bir panelde incele.
              </p>
            </div>

            {analysis ? (
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                <Download className="h-4 w-4" />
                Özeti JSON İndir
              </button>
            ) : null}
          </div>
        </section>

        <UploadZone
          isLoading={isLoading}
          onFileSelect={handleFileUpload}
          onLoadSample={handleLoadSample}
          error={error}
        />

        {analysis ? (
          <>
            <section className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DatasetOverview analysis={analysis} />
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5">
                <p className="text-sm text-slate-600">Yüklü dosya</p>
                <h2 className="mt-2 truncate text-lg font-semibold text-slate-900">
                  {analysis.fileName}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  {formatNumber(analysis.dataset.rowCount, 0)} satır ve {" "}
                  {formatNumber(analysis.dataset.columnCount, 0)} kolon analiz edildi.
                </p>
              </div>
            </section>

            <ColumnsGlance analysis={analysis} />

            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">
                    Kolon Arama
                  </h2>
                  <p className="text-sm text-slate-600">Kolon adı veya tipine göre filtrele</p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Örn: revenue, categorical, date"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-cyan-300 placeholder:text-slate-400 focus:ring"
                  />
                </div>
              </div>
            </section>

            <ColumnAnalysisTable columns={filteredColumns} />

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MissingValuesChart columns={analysis.columnSummaries} />
              </div>
              <NumericDistributionChart summaries={analysis.numericSummaries} />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <CategoricalTopChart summaries={analysis.categoricalSummaries} />
              <DataPreviewTable
                headers={analysis.dataset.columnNames}
                rows={analysis.previewRows}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <NumericSummaryTable summaries={analysis.numericSummaries} />
              <CategoricalSummaryTable summaries={analysis.categoricalSummaries} />
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm shadow-slate-900/5">
            <h2 className="text-xl font-semibold text-slate-900">Veri bekleniyor</h2>
            <p className="mt-2 text-sm text-slate-600">
              Başlamak için bir CSV dosyası seçebilir veya örnek veri yükleyebilirsin.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
