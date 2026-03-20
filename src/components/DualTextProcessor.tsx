import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DualTextProcessorProps {
  title: string;
  description: string;
  processor: (text1: string, text2: string) => string;
  input1Label: string;
  input2Label: string;
  input1Placeholder: string;
  input2Placeholder: string;
}

const DualTextProcessor = ({
  title,
  description,
  processor,
  input1Label,
  input2Label,
  input1Placeholder,
  input2Placeholder
}: DualTextProcessorProps) => {
  const [input1Text, setInput1Text] = useState("");
  const [input2Text, setInput2Text] = useState("");
  const [outputText, setOutputText] = useState("");
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const countLines = (text: string): number => {
    if (!text.trim()) return 0;
    return text.split("\n").filter((line) => line.trim() !== "").length;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setTextFn: (text: string) => void
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    const invalid = files.find((f) => !f.name.toLowerCase().endsWith(".txt"));
    if (invalid) {
      toast({
        title: "Erro",
        description: `Arquivo inválido: ${invalid.name}. Use apenas .txt`,
        variant: "destructive"
      });
      return;
    }

    try {
      const contents = await Promise.all(files.map((f) => f.text()));
      const merged = contents.join("\n");
      setTextFn(merged);
      toast({
        title: "Arquivo(s) carregado(s)",
        description: `${countLines(merged).toLocaleString()} linhas importadas.`,
      });
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao ler o(s) arquivo(s)",
        variant: "destructive",
      });
    }
  };

  const processText = () => {
    if (countLines(input1Text) === 0 || countLines(input2Text) === 0) {
      toast({
        title: "Aviso",
        description: "Por favor, preencha ambas as entradas.",
        variant: "destructive",
      });
      return;
    }

    const result = processor(input1Text, input2Text);
    setOutputText(result);

    toast({
      title: "Processamento concluído",
      description: `${countLines(result).toLocaleString()} linhas no resultado.`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copiado!",
        description: `${countLines(outputText).toLocaleString()} linhas copiadas.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const lineCount = countLines(outputText);
    toast({
      title: "Download concluído",
      description: `${lineCount.toLocaleString()} linhas exportadas.`,
    });
  };

  return (
    <div className="container mx-auto px-6 py-6 space-y-6 max-w-6xl relative">
      <div className="relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{input1Label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput1Text("")}
              className="h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput1Ref.current?.click()}
              className="h-9"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar .txt
            </Button>
          </div>
          <div className="relative">
            <Textarea
              value={input1Text}
              onChange={(e) => setInput1Text(e.target.value)}
              placeholder={input1Placeholder}
              className="min-h-[200px] resize-none font-mono"
            />
            <div className="absolute bottom-2 right-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
              {countLines(input1Text).toLocaleString()} linhas
            </div>
          </div>
          <input
            ref={fileInput1Ref}
            type="file"
            accept=".txt"
            multiple
            onChange={(e) => handleFileUpload(e, setInput1Text)}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{input2Label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput2Text("")}
              className="h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput2Ref.current?.click()}
              className="h-9"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar .txt
            </Button>
          </div>
          <div className="relative">
            <Textarea
              value={input2Text}
              onChange={(e) => setInput2Text(e.target.value)}
              placeholder={input2Placeholder}
              className="min-h-[200px] resize-none font-mono"
            />
            <div className="absolute bottom-2 right-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
              {countLines(input2Text).toLocaleString()} linhas
            </div>
          </div>
          <input
            ref={fileInput2Ref}
            type="file"
            accept=".txt"
            multiple
            onChange={(e) => handleFileUpload(e, setInput2Text)}
            className="hidden"
          />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={processText}
          className="w-full max-w-md text-lg py-3"
          data-process="true"
        >
          Processar Texto
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOutputText("")}
              className="h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={countLines(outputText) === 0}
              className="h-9"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            {countLines(outputText) > 1000 && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTxt}
                className="h-9"
              >
                <Download className="w-4 h-4 mr-2" />
                Download .txt
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              value={outputText}
              readOnly
              placeholder="O resultado aparecerá aqui..."
              className="min-h-[200px] resize-none bg-muted/30 font-mono"
            />
            <div className="absolute bottom-2 right-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
              {countLines(outputText).toLocaleString()} linhas
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default DualTextProcessor;
