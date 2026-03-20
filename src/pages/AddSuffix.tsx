import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Trash2, Upload, Play } from "lucide-react";
import { addLoginSuffix, countLines } from "@/utils/textProcessors";
import { toast } from "sonner";

const AddSuffix = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [suffix, setSuffix] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.find((f) => !f.name.toLowerCase().endsWith(".txt"));
    if (invalid) {
      toast.error(`Arquivo inválido: ${invalid.name}. Use apenas .txt`);
      return;
    }

    try {
      const contents = await Promise.all(files.map((f) => f.text()));
      const merged = contents.join("\n");
      setInputText(merged);
      toast.success(
        files.length === 1 ? `Arquivo "${files[0].name}" importado` : `${files.length} arquivos concatenados`
      );
    } catch {
      toast.error("Erro ao ler o(s) arquivo(s)");
    }
  }, []);

  const handleProcess = useCallback(() => {
    if (!inputText.trim()) {
      toast.error("Cole o texto na entrada");
      return;
    }

    if (!suffix) {
      toast.error("Digite o sufixo");
      return;
    }

    const result = addLoginSuffix(inputText, suffix);
    setOutputText(result);

    const inputLines = countLines(inputText);
    const outputLines = countLines(result);
    toast.success(`Processado: ${inputLines} linhas → ${outputLines} linhas`);
  }, [inputText, suffix]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(outputText);
    toast.success("Copiado!");
  }, [outputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `com-sufixo-${suffix.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download iniciado");
  }, [outputText, suffix]);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutputText("");
    toast.success("Limpo!");
  }, []);

  const inputLines = countLines(inputText);
  const outputLines = countLines(outputText);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Adicionar Sufixo</h1>
          <p className="text-muted-foreground">
            Adiciona um sufixo ao final do login (antes dos dois-pontos)
          </p>
        </div>

        {/* Suffix Input */}
        <div className="glass-card p-4 rounded-xl">
          <Label htmlFor="suffix" className="text-sm font-medium text-foreground">
            Sufixo a adicionar
          </Label>
          <Input
            id="suffix"
            type="text"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="mt-2 max-w-md bg-background/50"
            placeholder="Digite o sufixo..."
          />
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">
              Entrada ({inputLines} linhas)
            </Label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".txt"
                multiple
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Importar .txt
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Cole suas linhas aqui..."
            className="min-h-[300px] font-mono text-sm bg-background/50"
          />
        </div>

        {/* Process Button */}
        <div className="flex justify-center">
          <Button onClick={handleProcess} className="w-full max-w-md" data-process="true">
            <Play className="h-4 w-4 mr-2" />
            Processar
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">
              Saída ({outputLines} linhas)
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!outputText}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              {outputLines > 1000 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!outputText}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar .txt
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={outputText}
            readOnly
            placeholder="O resultado aparecerá aqui..."
            className="min-h-[300px] font-mono text-sm bg-background/50"
          />
        </div>
      </div>
    </div>
  );
};

export default AddSuffix;
