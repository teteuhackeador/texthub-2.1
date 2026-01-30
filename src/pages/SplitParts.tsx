import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { splitIntoParts, countLines } from "@/utils/textProcessors";

const SplitParts = () => {
  const [inputText, setInputText] = useState("");
  const [numPartsInput, setNumPartsInput] = useState("2");
  const [outputParts, setOutputParts] = useState<string[]>([]);
  const { toast } = useToast();

  // UX safety: rendering hundreds/thousands of parts will freeze the UI.
  // (Even if the split itself is fast, the DOM work isn't.)
  const MAX_PARTS_UI = 200;

  const handleProcess = useCallback(() => {
    if (!inputText.trim()) {
      toast({
        title: "Entrada vazia",
        description: "Por favor, insira algum texto para processar.",
        variant: "destructive",
      });
      return;
    }

    const numParts = parseInt(numPartsInput) || 0;
    if (numParts <= 0) {
      toast({
        title: "Número inválido",
        description: "O número de partes deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const totalLines = countLines(inputText);
    if (totalLines === 0) {
      toast({
        title: "Sem linhas válidas",
        description: "Nada para dividir (todas as linhas estão vazias).",
        variant: "destructive",
      });
      return;
    }

    // Clamp to avoid creating tons of empty parts.
    const safeParts = Math.min(numParts, totalLines);

    // Hard cap to prevent the UI from attempting to render too many cards/textareas.
    if (safeParts > MAX_PARTS_UI) {
      toast({
        title: "Valor muito alto",
        description: `Para evitar travar a página, o máximo permitido é ${MAX_PARTS_UI} partes. (Você pediu ${safeParts}.)`,
        variant: "destructive",
      });
      return;
    }

    const parts = splitIntoParts(inputText, safeParts);
    setOutputParts(parts);

    toast({
      title: "Texto dividido",
      description: `Dividido em ${parts.length} partes.`,
    });
  }, [inputText, numPartsInput, toast]);

  const handleCopy = useCallback((text: string, partNumber: number) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `Parte ${partNumber} copiada para a área de transferência.`,
    });
  }, [toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
        toast({
          title: "Arquivo carregado",
          description: `${countLines(text)} linhas importadas.`,
        });
      };
      reader.readAsText(file);
    }
  }, [toast]);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutputParts([]);
  }, []);

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl relative">
      <Card className="glass-card relative z-10">
        <CardHeader>
          <CardTitle className="text-foreground">Dividir em Partes</CardTitle>
          <CardDescription>
            Divide as linhas em um número de partes iguais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Entrada ({countLines(inputText)} linhas)
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder=""
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Number of Parts Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Quantas partes?
            </label>
            <Input
              type="text"
              inputMode="numeric"
              value={numPartsInput}
              onChange={(e) => setNumPartsInput(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            className="w-full"
            size="lg"
            data-process="true"
          >
            Dividir em Partes
          </Button>

          {/* Output Parts */}
          {outputParts.length > 0 && (
            <div className="space-y-4 pt-4">
              {outputParts.map((part, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      PARTE {index + 1} ({countLines(part)} linhas)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(part, index + 1)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Textarea
                    value={part}
                    readOnly
                    placeholder="Resultado aparecerá aqui..."
                    className="min-h-[150px] font-mono text-sm bg-muted/50"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SplitParts;
