import TextProcessor from "@/components/TextProcessor";
import { removeKeyword } from "@/utils/textProcessors";

const RemoveKeyword = () => {
  return (
    <TextProcessor
      title="Remover Palavra-chave"
      description="Remove linhas que contenham uma palavra específica"
      processor={removeKeyword}
      processorType="removeKeyword"
      needsKeyword={true}
      keywordPlaceholder="Digite a palavra-chave a ser removida..."
    />
  );
};

export default RemoveKeyword;
