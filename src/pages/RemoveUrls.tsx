import TextProcessor from "@/components/TextProcessor";
import { removeUrls } from "@/utils/textProcessors";

const RemoveUrls = () => {
  return (
    <TextProcessor
      title="Remover URL"
      description="Remove URLs e mantém apenas as senhas (após último ':')"
      processor={removeUrls}
      processorType="removeUrls"
    />
  );
};

export default RemoveUrls;
