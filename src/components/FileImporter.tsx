import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileImporterProps {
  onImportComplete: (lines: string[]) => void;
  onImportStart?: () => void;
  onImportCancel?: () => void;
  accept?: string;
  maxFileSize?: number; // in bytes, default 500MB (per file)
  disabled?: boolean;
  className?: string;
}

interface ImportProgress {
  percent: number;
  bytesRead: number;
  totalBytes: number;
  linesRead: number;
  fileIndex: number;
  totalFiles: number;
  fileName: string;
}

const VALID_EXTENSIONS = [".txt", ".json", ".csv"];

export const FileImporter = ({
  onImportComplete,
  onImportStart,
  onImportCancel,
  accept = ".txt,.json,.csv",
  maxFileSize = 500 * 1024 * 1024, // 500MB default
  disabled = false,
  className
}: FileImporterProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number>(0);

  const queueRef = useRef<File[]>([]);
  const currentIndexRef = useRef(0);
  const accumulatedLinesRef = useRef<string[]>([]);
  const totalBytesRef = useRef(0);
  const processedBytesRef = useRef(0);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const getEstimatedTimeRemaining = (): string => {
    if (!progress || progress.percent === 0) return "";

    const elapsed = Date.now() - startTimeRef.current;
    const totalEstimated = (elapsed / progress.percent) * 100;
    const remaining = totalEstimated - elapsed;

    if (remaining < 1000) return "< 1s";
    if (remaining < 60000) return Math.ceil(remaining / 1000) + "s";
    return Math.ceil(remaining / 60000) + "min";
  };

  const initWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = new Worker(new URL("../workers/fileReader.worker.ts", import.meta.url), {
      type: "module"
    });

    workerRef.current.onmessage = (e) => {
      const { type } = e.data;
      const currentFile = queueRef.current[currentIndexRef.current];
      if (!currentFile) return;

      if (type === "progress") {
        const overallBytesRead = processedBytesRef.current + e.data.bytesRead;
        const totalBytes = totalBytesRef.current || e.data.totalBytes;
        const percent = totalBytes > 0 ? Math.min((overallBytesRead / totalBytes) * 100, 100) : e.data.percent;

        setProgress({
          percent: Math.round(percent),
          bytesRead: overallBytesRead,
          totalBytes,
          linesRead: accumulatedLinesRef.current.length + (e.data.linesRead ?? 0),
          fileIndex: currentIndexRef.current + 1,
          totalFiles: queueRef.current.length,
          fileName: currentFile.name
        });
      } else if (type === "complete") {
        accumulatedLinesRef.current = accumulatedLinesRef.current.concat(e.data.lines);
        processedBytesRef.current += currentFile.size;

        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < queueRef.current.length) {
          currentIndexRef.current = nextIndex;
          workerRef.current?.postMessage({ type: "read", file: queueRef.current[nextIndex] });
          return;
        }

        // Done
        setIsImporting(false);
        setProgress(null);
        onImportComplete(accumulatedLinesRef.current);

        // reset internal state
        queueRef.current = [];
        currentIndexRef.current = 0;
        accumulatedLinesRef.current = [];
        totalBytesRef.current = 0;
        processedBytesRef.current = 0;
      } else if (type === "error") {
        setIsImporting(false);
        setProgress(null);
        setError(e.data.message);
      }
    };

    workerRef.current.onerror = (e) => {
      setIsImporting(false);
      setProgress(null);
      setError("Erro no worker: " + e.message);
    };
  }, [onImportComplete]);

  useEffect(() => {
    initWorker();
    return () => workerRef.current?.terminate();
  }, [initWorker]);

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) return "Nenhum arquivo selecionado";

    for (const file of files) {
      if (file.size > maxFileSize) {
        return `Arquivo muito grande: ${file.name}. Máximo por arquivo: ${formatBytes(maxFileSize)}`;
      }

      const hasValidExtension = VALID_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
      if (!hasValidExtension) {
        return `Arquivo não suportado: ${file.name}. Use apenas .txt, .json ou .csv`;
      }
    }

    return null;
  };

  const processFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const validationError = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Ensure stable ordering (FileList is already ordered, but keep it explicit)
      const queue = [...files];

      setIsImporting(true);
      startTimeRef.current = Date.now();
      onImportStart?.();

      queueRef.current = queue;
      currentIndexRef.current = 0;
      accumulatedLinesRef.current = [];
      totalBytesRef.current = queue.reduce((sum, f) => sum + f.size, 0);
      processedBytesRef.current = 0;

      // First file
      workerRef.current?.postMessage({ type: "read", file: queue[0] });
    },
    [maxFileSize, onImportStart]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) processFiles(files);
    // Reset input so same files can be selected again
    event.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isImporting) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isImporting) return;

    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) processFiles(files);
  };

  const handleCancel = () => {
    initWorker();

    setIsImporting(false);
    setProgress(null);
    setError(null);

    queueRef.current = [];
    currentIndexRef.current = 0;
    accumulatedLinesRef.current = [];
    totalBytesRef.current = 0;
    processedBytesRef.current = 0;

    onImportCancel?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled || isImporting}
      />

      {isImporting && progress ? (
        <div className="space-y-2 p-4 rounded-md border border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary animate-pulse shrink-0" />
              <span className="truncate">
                Importando {progress.fileIndex}/{progress.totalFiles}: {progress.fileName}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 px-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Progress value={progress.percent} className="h-2" />

          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-between text-xs text-muted-foreground">
            <span>
              {formatBytes(progress.bytesRead)} / {formatBytes(progress.totalBytes)}
            </span>
            <span>{progress.linesRead.toLocaleString()} linhas</span>
            <span>{progress.percent}%</span>
            {getEstimatedTimeRemaining() && <span>~{getEstimatedTimeRemaining()}</span>}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex items-center justify-center p-4 rounded-md border-2 border-dashed transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className={cn("w-8 h-8", isDragOver ? "text-primary" : "text-muted-foreground")} />
            <div className="text-sm">
              <span className="font-medium text-foreground">Clique para importar</span>
              <span className="text-muted-foreground"> ou arraste os arquivos</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Arquivos .txt, .json e .csv até {formatBytes(maxFileSize)} (por arquivo)
            </span>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-destructive p-2 rounded bg-destructive/10">{error}</div>}
    </div>
  );
};
