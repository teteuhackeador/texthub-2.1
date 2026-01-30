import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileImporter } from "@/components/FileImporter";
import { VirtualTextarea } from "@/components/VirtualTextarea";

const FilterIntelX = () => {
  const [inputLines, setInputLines] = useState<string[]>([]);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  const workerRef = useRef<Worker | null>(null);
  const { toast } = useToast();

  // Initialize processing worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/textProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      const { type } = e.data;

      if (type === 'progress') {
        setProcessProgress(e.data.progress);
      } else if (type === 'result') {
        setIsProcessing(false);
        setProcessProgress(0);
        setOutputLines(e.data.lines);

        toast({
          title: "Sucesso",
          description: `${e.data.lines.length.toLocaleString()} linhas extraídas.`,
        });
      } else if (type === 'error') {
        setIsProcessing(false);
        setProcessProgress(0);
        toast({
          title: "Erro",
          description: e.data.message,
          variant: "destructive",
        });
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [toast]);

  const handleImportComplete = useCallback((lines: string[]) => {
    setInputLines(lines);
    toast({
      title: "Arquivo importado",
      description: `${lines.length.toLocaleString()} linhas carregadas.`,
    });
  }, [toast]);

  const handleProcess = () => {
    if (inputLines.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, importe um arquivo para processar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);

    workerRef.current?.postMessage({
      type: 'process',
      lines: inputLines,
      processorName: 'filterIntelX'
    });
  };

  const handleCopy = async () => {
    if (outputLines.length === 0) return;

    const text = outputLines.join('\n');
    await navigator.clipboard.writeText(text);

    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const handleDownload = () => {
    if (outputLines.length === 0) return;

    const text = outputLines.join('\n');
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intelx-filtrado.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputLines([]);
    setOutputLines([]);
  };

  return (
    <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Filtrar IntelX</h1>
          <p className="text-muted-foreground">
            Extrai login:senha de dados no formato IntelX (otimizado para arquivos grandes)
          </p>
        </div>

        {/* File Importer */}
        <div className="glass-card rounded-xl p-4">
          <FileImporter
            onImportComplete={handleImportComplete}
            maxFileSize={500 * 1024 * 1024} // 500MB
          />
        </div>

        {/* Input Preview */}
        {inputLines.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Entrada ({inputLines.length.toLocaleString()} linhas)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputLines([])}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <VirtualTextarea
              lines={inputLines.slice(0, 5000)} // Preview only first 5000 lines
              readOnly
              placeholder="Arquivo importado aparecerá aqui..."
              height={200}
            />
            {inputLines.length > 5000 && (
              <p className="text-xs text-muted-foreground text-center">
                Mostrando apenas as primeiras 5.000 linhas de {inputLines.length.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Process Button */}
        <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2">
          <Button
            onClick={handleProcess}
            disabled={inputLines.length === 0 || isProcessing}
            className="min-w-[200px]"
            data-process="true"
          >
            {isProcessing ? 'Processando...' : 'Processar'}
          </Button>

          {isProcessing && (
            <div className="w-full max-w-md space-y-1">
              <Progress value={processProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(processProgress)}% processado
              </p>
            </div>
          )}
        </div>

        {/* Output Section */}
        {outputLines.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Saída ({outputLines.length.toLocaleString()} linhas)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOutputLines([])}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar .txt
                </Button>
              </div>
            </div>
            <VirtualTextarea
              lines={outputLines.slice(0, 10000)} // Preview only first 10000 lines
              readOnly
              placeholder="Resultado aparecerá aqui..."
              height={300}
            />
            {outputLines.length > 10000 && (
              <p className="text-xs text-muted-foreground text-center">
                Mostrando apenas as primeiras 10.000 linhas de {outputLines.length.toLocaleString()}.
                Use "Baixar .txt" para obter o arquivo completo.
              </p>
            )}
          </div>
        )}

        {/* Clear All Button */}
        {(inputLines.length > 0 || outputLines.length > 0) && (
          <div className="glass-card rounded-xl p-4 flex justify-center">
            <Button variant="outline" onClick={handleClear}>
              Limpar Tudo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterIntelX;
