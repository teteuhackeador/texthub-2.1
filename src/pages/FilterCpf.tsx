import TextProcessor from "@/components/TextProcessor";
import { filterCpfLogins } from "@/utils/textProcessors";

const FilterCpf = () => {
  return (
    <TextProcessor
      title="Filtrar Log CPF"
      description="Mantém apenas linhas onde o login tenha exatamente 11 dígitos"
      processor={filterCpfLogins}
      processorType="filterCpfLogins"
    />
  );
};

export default FilterCpf;
