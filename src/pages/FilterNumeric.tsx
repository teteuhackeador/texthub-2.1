import TextProcessor from "@/components/TextProcessor";
import { filterNumericLogins } from "@/utils/textProcessors";

const FilterNumeric = () => {
  return (
    <TextProcessor
      title="Filtrar 123..."
      description="Mantém apenas linhas onde o login tenha apenas números"
      processor={filterNumericLogins}
      processorType="filterNumericLogins"
    />
  );
};

export default FilterNumeric;
