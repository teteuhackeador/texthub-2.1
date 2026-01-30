import DualTextProcessor from "@/components/DualTextProcessor";
import { removeChecked } from "@/utils/textProcessors";

const RemoveChecked = () => {
  return (
    <DualTextProcessor
      title="Remover Checados"
      description="Remove as linhas que já foram verificadas, mantendo apenas as linhas novas"
      processor={removeChecked}
      input1Label="Credenciais já verificadas"
      input2Label="Credenciais a verificar"
      input1Placeholder="Cole as credenciais que já foram verificadas..."
      input2Placeholder="Cole as credenciais que deseja verificar..."
    />
  );
};

export default RemoveChecked;
