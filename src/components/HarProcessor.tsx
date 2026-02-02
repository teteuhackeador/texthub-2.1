import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Copy, Download, X, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processHarContent } from "@/utils/harProcessor";

const HarProcessor = () => {
  const [inputContent, setInputContent] = useState("");
  const [outputContent, setOutputContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.har') && !file.name.endsWith('.txt')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo .har ou .txt",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      setInputContent(text);
      toast({
        title: "Arquivo carregado",
        description: `${file.name} carregado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ler o arquivo",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const processHar = () => {
    if (!inputContent.trim()) {
      toast({
        title: "Aviso",
        description: "Por favor, carregue um arquivo HAR",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = processHarContent(inputContent);
      setOutputContent(result);
      toast({
        title: "Processamento concluído",
        description: "Arquivo HAR reduzido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar arquivo HAR",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputContent);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive",
      });
    }
  };

  const downloadResult = () => {
    const blob = new Blob([outputContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "har-reduced.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "har-reduced.json",
    });
  };

  const clearInput = () => {
    setInputContent("");
    setOutputContent("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-6 h-6" />
            Reduzir HAR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Arquivo HAR</label>
                {inputContent && (
                  <span className="text-xs text-muted-foreground">
                    ({inputContent.split('\n').length} linhas)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("har-upload")?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Carregar .har
                </Button>
                <input
                  id="har-upload"
                  type="file"
                  accept=".har,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {inputContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearInput}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Cole o conteúdo do arquivo HAR aqui ou use o botão 'Carregar .har' acima"
              className="font-mono text-xs h-48 resize-none"
            />
          </div>

          {/* Process Button */}
          <Button
            onClick={processHar}
            className="w-full"
            disabled={isProcessing || !inputContent}
          >
            {isProcessing ? "Processando..." : "Processar HAR"}
          </Button>

          {/* Output Section */}
          {outputContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Resultado</label>
                  <span className="text-xs text-muted-foreground">
                    ({outputContent.split('\n').length} linhas)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResult}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={outputContent}
                readOnly
                className="font-mono text-xs h-96 resize-none"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HarProcessor;
