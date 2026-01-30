import TextProcessor from "@/components/TextProcessor";
import { removeDomain } from "@/utils/textProcessors";

const RemoveDomain = () => {
  return (
    <TextProcessor
      title="Remover Domínio"
      description="Remove o domínio do email (do @ até o :), mantendo apenas o usuário"
      processor={removeDomain}
      processorType="removeDomain"
    />
  );
};

export default RemoveDomain;
