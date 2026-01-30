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
  maxFileSize?: number; // in bytes, default 500MB
  disabled?: boolean;
  className?: string;
}

interface ImportProgress {
  percent: number;
  bytesRead: number;
  totalBytes: number;
  linesRead: number;
}

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

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/fileReader.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      const { type } = e.data;

      if (type === 'progress') {
        setProgress({
          percent: e.data.percent,
          bytesRead: e.data.bytesRead,
          totalBytes: e.data.totalBytes,
          linesRead: e.data.linesRead
        });
      } else if (type === 'complete') {
        setIsImporting(false);
        setProgress(null);
        onImportComplete(e.data.lines);
      } else if (type === 'error') {
        setIsImporting(false);
        setProgress(null);
        setError(e.data.message);
      }
    };

    workerRef.current.onerror = (e) => {
      setIsImporting(false);
      setProgress(null);
      setError('Erro no worker: ' + e.message);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [onImportComplete]);

  const processFile = useCallback((file: File) => {
    setError(null);

    if (file.size > maxFileSize) {
      setError(`Arquivo muito grande. Máximo: ${formatBytes(maxFileSize)}`);
      return;
    }

    const validExtensions = ['.txt', '.json', '.csv'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      setError('Apenas arquivos .txt, .json e .csv são suportados');
      return;
    }

    setIsImporting(true);
    startTimeRef.current = Date.now();
    onImportStart?.();

    workerRef.current?.postMessage({ type: 'read', file });
  }, [maxFileSize, onImportStart]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isImporting) {
      setIsDragOver(true);
    }
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCancel = () => {
    workerRef.current?.terminate();
    // Reinitialize worker
    workerRef.current = new Worker(
      new URL('../workers/fileReader.worker.ts', import.meta.url),
      { type: 'module' }
    );
    setIsImporting(false);
    setProgress(null);
    onImportCancel?.();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getEstimatedTimeRemaining = (): string => {
    if (!progress || progress.percent === 0) return '';

    const elapsed = Date.now() - startTimeRef.current;
    const totalEstimated = (elapsed / progress.percent) * 100;
    const remaining = totalEstimated - elapsed;

    if (remaining < 1000) return '< 1s';
    if (remaining < 60000) return Math.ceil(remaining / 1000) + 's';
    return Math.ceil(remaining / 60000) + 'min';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled || isImporting}
      />

      {isImporting && progress ? (
        <div className="space-y-2 p-4 rounded-md border border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary animate-pulse" />
              <span>Importando...</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-6 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Progress value={progress.percent} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatBytes(progress.bytesRead)} / {formatBytes(progress.totalBytes)}
            </span>
            <span>{progress.linesRead.toLocaleString()} linhas</span>
            <span>{progress.percent}%</span>
            {getEstimatedTimeRemaining() && (
              <span>~{getEstimatedTimeRemaining()}</span>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex items-center justify-center p-4 rounded-md border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className={cn(
              "w-8 h-8",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="text-sm">
              <span className="font-medium text-foreground">
                Clique para importar
              </span>
              <span className="text-muted-foreground"> ou arraste o arquivo</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Arquivos .txt, .json e .csv até {formatBytes(maxFileSize)}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive p-2 rounded bg-destructive/10">
          {error}
        </div>
      )}
    </div>
  );
};
