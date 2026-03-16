import type { ColumnType } from "./types";

const MISSING_TOKENS = new Set([
  "",
  "na",
  "n/a",
  "nan",
  "null",
  "none",
  "undefined",
  "-",
  "--",
]);

const BOOLEAN_TRUE = new Set(["true", "yes", "y", "1"]);
const BOOLEAN_FALSE = new Set(["false", "no", "n", "0"]);

const NUMERIC_REGEX = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

export function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function isMissingValue(value: string): boolean {
  return MISSING_TOKENS.has(value.toLowerCase());
}

export function isBooleanValue(value: string): boolean {
  if (isMissingValue(value)) {
    return false;
  }

  const normalized = value.toLowerCase();
  return BOOLEAN_TRUE.has(normalized) || BOOLEAN_FALSE.has(normalized);
}

export function isNumericValue(value: string): boolean {
  if (isMissingValue(value)) {
    return false;
  }

  const cleaned = value.replace(/,/g, "").replace(/\s+/g, "");
  if (cleaned === "") {
    return false;
  }

  if (!NUMERIC_REGEX.test(cleaned)) {
    return false;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed);
}

export function toNumber(value: string): number {
  return Number(value.replace(/,/g, "").replace(/\s+/g, ""));
}

export function isDateLikeValue(value: string): boolean {
  if (isMissingValue(value) || isNumericValue(value)) {
    return false;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return false;
  }

  // Kısa ve alfasayısal tarihlere öncelik vererek serbest metni azalt.
  const dateShapeRegex =
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$|^[A-Za-z]{3,}\s+\d{1,2},\s*\d{4}$/;
  return dateShapeRegex.test(value);
}

export function inferColumnType(values: string[]): ColumnType {
  const nonMissing = values.filter((value) => !isMissingValue(value));

  if (nonMissing.length === 0) {
    return "text";
  }

  const sample = nonMissing.slice(0, 250);
  const total = sample.length;

  const numericMatches = sample.filter(isNumericValue).length;
  if (numericMatches / total >= 0.9) {
    return "numeric";
  }

  const booleanMatches = sample.filter(isBooleanValue).length;
  if (booleanMatches / total >= 0.9) {
    return "boolean";
  }

  const dateMatches = sample.filter(isDateLikeValue).length;
  if (dateMatches / total >= 0.8) {
    return "date-like";
  }

  const uniqueRatio = new Set(sample.map((value) => value.toLowerCase())).size / total;
  if (uniqueRatio <= 0.45 || new Set(sample).size <= 30) {
    return "categorical";
  }

  return "text";
}

export function sanitizeHeaders(headerRow: unknown[], maxColumns: number): string[] {
  const rawHeaders = Array.from({ length: maxColumns }, (_, index) => {
    const source = index < headerRow.length ? headerRow[index] : "";
    const normalized = normalizeCellValue(source);
    return normalized || `column_${index + 1}`;
  });

  const occurrenceMap = new Map<string, number>();

  return rawHeaders.map((header) => {
    const key = header.toLowerCase();
    const count = occurrenceMap.get(key) ?? 0;
    occurrenceMap.set(key, count + 1);

    if (count === 0) {
      return header;
    }

    return `${header}_${count + 1}`;
  });
}

export function buildHistogram(values: number[], bins = 10): Array<{ range: string; count: number }> {
  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [
      {
        range: min.toFixed(2),
        count: values.length,
      },
    ];
  }

  const bucketCount = Math.max(5, Math.min(bins, 20));
  const step = (max - min) / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    min: min + index * step,
    max: index === bucketCount - 1 ? max : min + (index + 1) * step,
    count: 0,
  }));

  values.forEach((value) => {
    const bucketIndex = Math.min(Math.floor((value - min) / step), bucketCount - 1);
    buckets[bucketIndex].count += 1;
  });

  return buckets.map((bucket) => ({
    range: `${bucket.min.toFixed(1)} - ${bucket.max.toFixed(1)}`,
    count: bucket.count,
  }));
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits,
  }).format(value);
}
