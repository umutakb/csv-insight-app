export type ColumnType = "numeric" | "categorical" | "boolean" | "date-like" | "text";

export type CsvRow = Record<string, string>;

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  columnNames: string[];
}

export interface ColumnSummary {
  name: string;
  type: ColumnType;
  nonMissingCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
}

export interface NumericSummary {
  name: string;
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  values: number[];
  histogram: Array<{
    range: string;
    count: number;
  }>;
}

export interface CategoricalTopValue {
  value: string;
  count: number;
}

export interface CategoricalSummary {
  name: string;
  uniqueCount: number;
  topValues: CategoricalTopValue[];
}

export interface CsvAnalysisResult {
  fileName: string;
  dataset: DatasetSummary;
  rows: CsvRow[];
  previewRows: CsvRow[];
  columnSummaries: ColumnSummary[];
  numericSummaries: NumericSummary[];
  categoricalSummaries: CategoricalSummary[];
}
