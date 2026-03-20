import TextProcessor from "@/components/TextProcessor";
import { keepKeyword } from "@/utils/textProcessors";

const KeepKeyword = () => {
  return (
    <TextProcessor
      title="Manter Palavra-chave"
      description="Mantém apenas linhas que contenham uma palavra específica"
      processor={keepKeyword}
      processorType="keepKeyword"
      needsKeyword={true}
      keywordPlaceholder="Digite a palavra-chave a ser mantida..."
    />
  );
};

export default KeepKeyword;
