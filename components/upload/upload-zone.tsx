"use client";

import { FileDown, FileUp, LoaderCircle } from "lucide-react";
import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

import { cn } from "@/lib/utils";

interface UploadZoneProps {
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  error: string | null;
}

export function UploadZone({
  isLoading,
  onFileSelect,
  onLoadSample,
  error,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }

    // Aynı dosyayı tekrar seçebilmek için input resetlenir.
    event.currentTarget.value = "";
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-sm shadow-cyan-900/5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging
            ? "border-cyan-500 bg-cyan-100/60"
            : "border-cyan-300/70 bg-white/80",
        )}
      >
        <div className="mb-4 rounded-full bg-cyan-100 p-3 text-cyan-700">
          {isLoading ? (
            <LoaderCircle className="h-7 w-7 animate-spin" />
          ) : (
            <FileUp className="h-7 w-7" />
          )}
        </div>

        <h2 className="text-xl font-semibold text-slate-900">CSV dosyanı bırak veya yükle</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Başlık satırı olan bir `.csv` dosyası yüklediğinde kolon tipleri, eksik değer
          analizi, istatistikler ve grafikler anında oluşur.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileDown className="h-4 w-4" />
            Dosya Seç
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Örnek Veriyi Yükle
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-xs text-slate-500">Maksimum performans için 100K satır altı önerilir.</p>
      )}
    </div>
  );
}
