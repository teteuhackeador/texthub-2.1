import TextProcessor from "@/components/TextProcessor";
import { filterUserLogins } from "@/utils/textProcessors";

const FilterUser = () => {
  return (
    <TextProcessor
      title="Filtrar Log User"
      description="Mantém apenas linhas onde o login tenha apenas letras e pontos"
      processor={filterUserLogins}
      processorType="filterUserLogins"
    />
  );
};

export default FilterUser;
