import TextProcessor from "@/components/TextProcessor";
import { removeDuplicates } from "@/utils/textProcessors";

const RemoveDuplicates = () => {
  return (
    <TextProcessor
      title="Remover Duplicatas"
      description="Remove linhas duplicadas do texto"
      processor={removeDuplicates}
      processorType="removeDuplicates"
    />
  );
};

export default RemoveDuplicates;
