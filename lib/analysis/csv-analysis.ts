import Papa from "papaparse";

import {
  buildHistogram,
  inferColumnType,
  isMissingValue,
  isNumericValue,
  normalizeCellValue,
  sanitizeHeaders,
  toNumber,
} from "./helpers";
import type {
  CategoricalSummary,
  ColumnSummary,
  CsvAnalysisResult,
  CsvRow,
  NumericSummary,
} from "./types";

function computeMedian(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

function computeStdDev(values: number[], mean: number): number {
  if (values.length === 0) {
    return 0;
  }

  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

function normalizeRows(rawRows: unknown[][]): { headers: string[]; rows: CsvRow[] } {
  if (rawRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const maxColumns = rawRows.reduce(
    (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
    0,
  );

  if (maxColumns === 0) {
    return { headers: [], rows: [] };
  }

  const headerRow = Array.isArray(rawRows[0]) ? rawRows[0] : [];
  const headers = sanitizeHeaders(headerRow, maxColumns);

  const rows = rawRows.slice(1).map((rawRow) => {
    const source = Array.isArray(rawRow) ? rawRow : [];

    const rowRecord: CsvRow = {};
    headers.forEach((header, index) => {
      rowRecord[header] = normalizeCellValue(source[index]);
    });

    return rowRecord;
  });

  return { headers, rows };
}

function buildColumnSummaries(headers: string[], rows: CsvRow[]): ColumnSummary[] {
  return headers.map((header) => {
    const values = rows.map((row) => row[header] ?? "");
    const missingCount = values.filter((value) => isMissingValue(value)).length;
    const nonMissingValues = values.filter((value) => !isMissingValue(value));

    return {
      name: header,
      type: inferColumnType(values),
      nonMissingCount: nonMissingValues.length,
      missingCount,
      missingPercentage: rows.length === 0 ? 0 : (missingCount / rows.length) * 100,
      uniqueCount: new Set(nonMissingValues).size,
    };
  });
}

function buildNumericSummaries(
  columnSummaries: ColumnSummary[],
  rows: CsvRow[],
): NumericSummary[] {
  return columnSummaries
    .filter((column) => column.type === "numeric")
    .map((column) => {
      const values = rows
        .map((row) => row[column.name] ?? "")
        .filter((value) => !isMissingValue(value) && isNumericValue(value))
        .map(toNumber)
        .filter((value) => Number.isFinite(value));

      if (values.length === 0) {
        return {
          name: column.name,
          count: 0,
          min: 0,
          max: 0,
          mean: 0,
          median: 0,
          stdDev: 0,
          values: [],
          histogram: [],
        };
      }

      const count = values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((sum, value) => sum + value, 0) / count;
      const median = computeMedian(values);
      const stdDev = computeStdDev(values, mean);

      return {
        name: column.name,
        count,
        min,
        max,
        mean,
        median,
        stdDev,
        values,
        histogram: buildHistogram(values),
      };
    });
}

function buildCategoricalSummaries(
  columnSummaries: ColumnSummary[],
  rows: CsvRow[],
): CategoricalSummary[] {
  return columnSummaries
    .filter((column) => column.type === "categorical" || column.type === "boolean")
    .map((column) => {
      const values = rows
        .map((row) => row[column.name] ?? "")
        .filter((value) => !isMissingValue(value));

      const counter = new Map<string, number>();
      values.forEach((value) => {
        counter.set(value, (counter.get(value) ?? 0) + 1);
      });

      const topValues = Array.from(counter.entries())
        .sort((a, b) => {
          if (b[1] !== a[1]) {
            return b[1] - a[1];
          }
          return a[0].localeCompare(b[0], "tr");
        })
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      return {
        name: column.name,
        uniqueCount: counter.size,
        topValues,
      };
    });
}

export function analyzeCsvText(csvText: string, fileName: string): CsvAnalysisResult {
  const parsed = Papa.parse<unknown[]>(csvText, {
    skipEmptyLines: "greedy",
  });

  const blockingErrors = parsed.errors.filter((error) => error.type !== "Delimiter");
  if (blockingErrors.length > 0) {
    throw new Error("CSV dosyası ayrıştırılamadı. Lütfen dosya formatını kontrol edin.");
  }

  const rawRows = parsed.data.filter(
    (row): row is unknown[] => Array.isArray(row) && row.some((cell) => normalizeCellValue(cell) !== ""),
  );

  if (rawRows.length === 0) {
    throw new Error("CSV dosyasında analiz edilecek veri bulunamadı.");
  }

  const { headers, rows } = normalizeRows(rawRows);

  if (headers.length === 0) {
    throw new Error("CSV başlıkları okunamadı. İlk satırda kolon adları olmalı.");
  }

  const columnSummaries = buildColumnSummaries(headers, rows);
  const numericSummaries = buildNumericSummaries(columnSummaries, rows);
  const categoricalSummaries = buildCategoricalSummaries(columnSummaries, rows);

  return {
    fileName,
    dataset: {
      rowCount: rows.length,
      columnCount: headers.length,
      columnNames: headers,
    },
    rows,
    previewRows: rows.slice(0, 20),
    columnSummaries,
    numericSummaries,
    categoricalSummaries,
  };
}

export async function parseAndAnalyzeCsvFile(file: File): Promise<CsvAnalysisResult> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Lütfen .csv uzantılı bir dosya yükleyin.");
  }

  const text = await file.text();

  if (!text.trim()) {
    throw new Error("Yüklenen dosya boş görünüyor.");
  }

  return analyzeCsvText(text, file.name);
}
