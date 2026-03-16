import { Card } from "@/components/ui/card";
import type { CsvRow } from "@/lib/analysis/types";

interface DataPreviewTableProps {
  headers: string[];
  rows: CsvRow[];
}

export function DataPreviewTable({ headers, rows }: DataPreviewTableProps) {
  return (
    <Card title="Veri Önizleme" description="İlk 20 satır">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">Veri satırı bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="sticky top-0 z-10 border-b border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`preview-${rowIndex}`} className="border-b border-slate-100">
                  {headers.map((header) => (
                    <td key={`${rowIndex}-${header}`} className="max-w-52 truncate px-3 py-2 text-slate-700">
                      {row[header] || <span className="text-slate-400">(boş)</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
