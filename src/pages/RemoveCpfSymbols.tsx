import TextProcessor from "@/components/TextProcessor";
import { removeCpfSymbols } from "@/utils/textProcessors";

const RemoveCpfSymbols = () => {
  return (
    <TextProcessor
      title="Remover Símbolos CPF"
      description="Remove todos os pontos e hífens que vêm antes do último ':'"
      processor={removeCpfSymbols}
      processorType="removeCpfSymbols"
    />
  );
};

export default RemoveCpfSymbols;
