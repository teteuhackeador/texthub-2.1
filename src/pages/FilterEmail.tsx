import TextProcessor from "@/components/TextProcessor";
import { filterEmailLogins } from "@/utils/textProcessors";

const FilterEmail = () => {
  return (
    <TextProcessor
      title="Filtrar Log Email"
      description="Mantém apenas linhas onde o login seja um email válido"
      processor={filterEmailLogins}
      processorType="filterEmailLogins"
    />
  );
};

export default FilterEmail;
