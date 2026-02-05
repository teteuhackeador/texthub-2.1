import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Copy, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VirtualTextarea } from "@/components/VirtualTextarea";
import { Progress } from "@/components/ui/progress";
import { FileImporter } from "@/components/FileImporter";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type FilterMode = "login" | "password" | "login:password" | "url:login:password" | "user:password";

const FilterCloud = () => {
  const [inputLines, setInputLines] = useState<string[]>([]);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [showManualInput, setShowManualInput] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("login:password");
  const [paramUser, setParamUser] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const { toast } = useToast();

  const PREVIEW_LIMIT = 5000;
  const VIRTUALIZATION_THRESHOLD = 1000;

  const inputLineCount = inputLines.length;
  const outputLineCount = outputLines.length;

  const inputPreviewLines = useMemo(() =>
    inputLines.slice(0, PREVIEW_LIMIT),
    [inputLines]
  );

  const outputPreviewLines = useMemo(() =>
    outputLines.slice(0, PREVIEW_LIMIT),
    [outputLines]
  );

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/textProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'progress') {
        setProgress(e.data.progress);
      } else if (e.data.type === 'result') {
        setOutputLines(e.data.lines);
        setIsProcessing(false);
        setProgress(0);
        toast({
          title: "Processamento concluído",
          description: `${e.data.lines.length.toLocaleString()} linhas no resultado.`,
        });
      } else if (e.data.type === 'error') {
        setIsProcessing(false);
        setProgress(0);
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
    setInputText(lines.slice(0, PREVIEW_LIMIT).join('\n'));
    setUseVirtualization(lines.length > VIRTUALIZATION_THRESHOLD);
    setShowManualInput(false);

    toast({
      title: "Arquivo importado",
      description: `${lines.length.toLocaleString()} linhas carregadas.`,
    });
  }, [toast]);

  const processText = () => {
    if (inputLineCount === 0) {
      toast({
        title: "Aviso",
        description: "Por favor, insira algum texto para processar.",
        variant: "destructive",
      });
      return;
    }

    if (filterMode === "user:password" && !paramUser.trim()) {
      toast({
        title: "Aviso",
        description: "Por favor, informe o usuário.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    if (filterMode === "user:password") {
      workerRef.current?.postMessage({
        type: 'process',
        lines: inputLines,
        processorName: 'pairUserWithPasswords',
        keyword: paramUser,
      });
      return;
    }

    workerRef.current?.postMessage({
      type: 'process',
      lines: inputLines,
      processorName: 'filterCloudWithMode',
      keyword: filterMode
    });
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = outputLines.join('\n');
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copiado!",
        description: `${outputLineCount.toLocaleString()} linhas copiadas.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const clearInput = () => {
    setInputLines([]);
    setInputText("");
    setUseVirtualization(false);
    setShowManualInput(true);
  };

  const clearOutput = () => {
    setOutputLines([]);
  };

  const downloadTxt = () => {
    const textToDownload = outputLines.join('\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download concluído",
      description: `${outputLineCount.toLocaleString()} linhas exportadas.`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    setInputText(text);
    setInputLines(lines);
    setUseVirtualization(lines.length > VIRTUALIZATION_THRESHOLD);
  };

  const getModeLabel = (mode: FilterMode) => {
    switch (mode) {
      case "login": return "Login";
      case "password": return "Senha";
      case "login:password": return "Login:Senha";
      case "url:login:password": return "URL:Login:Senha";
      case "user:password": return "Usuário:Senha";
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 space-y-6 max-w-6xl relative">
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Filtrar Cloud</h1>
          <p className="text-muted-foreground">
            Extrai credenciais de arquivos JSON no formato cloud e também de logs em bloco (Host/Login/Password)
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Modo de Extração</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={filterMode}
              onValueChange={(value) => value && setFilterMode(value as FilterMode)}
              className="flex flex-wrap gap-2 justify-start"
            >
              <ToggleGroupItem
                value="login"
                className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Filtrar Login
              </ToggleGroupItem>
              <ToggleGroupItem
                value="password"
                className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Filtrar Senha
              </ToggleGroupItem>
              <ToggleGroupItem
                value="login:password"
                className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Filtrar Login:Senha
              </ToggleGroupItem>
              <ToggleGroupItem
                value="url:login:password"
                className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Filtrar URL:Login:Senha
              </ToggleGroupItem>

              <ToggleGroupItem
                value="user:password"
                className="px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Criar Usuário:Senha
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        {filterMode === "user:password" && (
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Parâmetros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
                <label className="text-sm text-muted-foreground">Usuário</label>
                <Input
                  value={paramUser}
                  onChange={(e) => setParamUser(e.target.value)}
                  placeholder="Digite o usuário..."
                />
                <p className="text-sm text-muted-foreground">
                  Cole as senhas no campo de entrada (1 por linha). O resultado será <span className="font-mono">usuario:senha</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card key={`input-${filterMode}`} className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {filterMode === "user:password" ? "Senhas" : "Texto de Entrada"}
              </CardTitle>
              {inputLineCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {inputLineCount.toLocaleString()} linhas
                  {inputLineCount > PREVIEW_LIMIT && ` (exibindo ${PREVIEW_LIMIT.toLocaleString()})`}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputLineCount === 0 && !showManualInput ? (
              <div className="space-y-4">
                <FileImporter
                  onImportComplete={handleImportComplete}
                  maxFileSize={500 * 1024 * 1024}
                />
                <div className="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualInput(true)}
                    className="text-muted-foreground"
                  >
                    Ou cole o texto manualmente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearInput}
                    className="h-9"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                  {!useVirtualization && inputLineCount === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowManualInput(false)}
                      className="h-9"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importar arquivo
                    </Button>
                  )}
                </div>
                <div className="relative">
                  {useVirtualization ? (
                    <VirtualTextarea
                      lines={inputPreviewLines}
                      placeholder="Cole seu texto aqui (uma linha por item)..."
                      height={300}
                    />
                  ) : (
                    <Textarea
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Cole seu texto aqui (uma linha por item)..."
                      className="min-h-[300px] resize-none font-mono"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
                    {inputLineCount.toLocaleString()} linhas
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={processText}
            disabled={isProcessing || inputLineCount === 0}
            className="w-full max-w-md text-lg py-3"
            data-process="true"
          >
            {isProcessing ? `Processando... ${Math.round(progress)}%` : `Processar (${getModeLabel(filterMode)})`}
          </Button>
          {isProcessing && (
            <Progress value={progress} className="w-full max-w-md" />
          )}
        </div>

        <Card key={`output-${filterMode}`} className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Resultado</CardTitle>
              {outputLineCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {outputLineCount.toLocaleString()} linhas
                  {outputLineCount > PREVIEW_LIMIT && ` (exibindo ${PREVIEW_LIMIT.toLocaleString()})`}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearOutput}
                disabled={outputLineCount === 0}
                className="h-9"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={outputLineCount === 0}
                className="h-9"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTxt}
                disabled={outputLineCount === 0}
                className="h-9"
              >
                <Download className="w-4 h-4 mr-2" />
                Download .txt
              </Button>
            </div>
            <div className="relative">
              {outputLineCount > VIRTUALIZATION_THRESHOLD ? (
                <VirtualTextarea
                  lines={outputPreviewLines}
                  readOnly
                  placeholder="O resultado aparecerá aqui..."
                  height={300}
                />
              ) : (
                <Textarea
                  value={outputLines.join('\n')}
                  readOnly
                  placeholder="O resultado aparecerá aqui..."
                  className="min-h-[300px] resize-none bg-muted/30 font-mono"
                />
              )}
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
                {outputLineCount.toLocaleString()} linhas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FilterCloud;
