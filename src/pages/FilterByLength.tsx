import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Trash2, Upload, Play } from "lucide-react";
import { toast } from "sonner";
import { filterByLoginLength, countLines } from "@/utils/textProcessors";

const FilterByLength = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [lengthInput, setLengthInput] = useState("3");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error("Por favor, selecione um arquivo .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      toast.success(`Arquivo importado: ${countLines(text)} linhas`);
    };
    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo");
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const clearInput = () => {
    setInputText("");
    toast.success("Entrada limpa");
  };

  const processText = () => {
    if (!inputText.trim()) {
      toast.error("Digite ou importe algum texto");
      return;
    }

    if (!lengthInput.trim()) {
      toast.error("Digite o número de caracteres");
      return;
    }

    const result = filterByLoginLength(inputText, lengthInput);
    setOutputText(result);

    const inputLines = countLines(inputText);
    const outputLines = countLines(result);
    toast.success(`Processado: ${inputLines} → ${outputLines} linhas`);
  };

  const copyToClipboard = async () => {
    if (!outputText) {
      toast.error("Nada para copiar");
      return;
    }
    await navigator.clipboard.writeText(outputText);
    toast.success("Copiado para a área de transferência");
  };

  const downloadTxt = () => {
    if (!outputText) {
      toast.error("Nada para baixar");
      return;
    }
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filtrado-${lengthInput.replace('-', '_')}-chars.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download iniciado");
  };

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Filtrar por Tamanho</h1>
            <p className="text-muted-foreground">
              Filtra linhas onde o login tem exatamente X caracteres (ordenado alfabeticamente)
            </p>
          </div>

          {/* Length Input */}
          <div className="glass-card p-4 rounded-xl">
            <Label htmlFor="length" className="text-sm font-medium text-foreground">
              Número de caracteres do login (ex: 3 ou 3-5)
            </Label>
            <Input
              id="length"
              type="text"
              value={lengthInput}
              onChange={(e) => setLengthInput(e.target.value)}
              className="mt-2 w-32 bg-background/50"
              placeholder="3 ou 3-5"
            />
          </div>

          {/* Input Section */}
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Entrada ({countLines(inputText)} linhas)
              </Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Importar .txt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearInput}
                  className="gap-2"
                  disabled={!inputText}
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar
                </Button>
              </div>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui as linhas no formato login:senha..."
              className="min-h-[200px] bg-background/50 font-mono text-sm"
            />
          </div>

          {/* Process Button */}
          <Button
            onClick={processText}
            className="w-full gap-2"
            size="lg"
            data-process="true"
          >
            <Play className="w-5 h-5" />
            Processar
          </Button>

          {/* Output Section */}
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Saída ({countLines(outputText)} linhas)
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                  disabled={!outputText}
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTxt}
                  className="gap-2"
                  disabled={!outputText}
                >
                  <Download className="w-4 h-4" />
                  Baixar .txt
                </Button>
              </div>
            </div>
            <Textarea
              value={outputText}
              readOnly
              placeholder="O resultado aparecerá aqui..."
              className="min-h-[200px] bg-background/50 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterByLength;
