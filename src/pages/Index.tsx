import ToolCard from "@/components/ToolCard";
import {
  Copy,
  Search,
  Link,
  Eye,
  CreditCard,
  Mail,
  User,
  CheckCheck,
  Split,
  Hash
} from "lucide-react";

const Index = () => {
  const tools = [
    {
      icon: Split,
      title: "Dividir em Partes",
      description: "Divide as linhas em um número de partes iguais.",
      path: "/dividir-partes"
    },
    {
      icon: CreditCard,
      title: "Filtrar Log CPF",
      description: "Mantém apenas linhas onde o login tenha exatamente 11 dígitos.",
      path: "/filter-cpf"
    },
    {
      icon: Mail,
      title: "Filtrar Log Email",
      description: "Mantém apenas linhas onde o login seja um email válido.",
      path: "/filter-email"
    },
    {
      icon: User,
      title: "Filtrar Log User",
      description: "Mantém apenas linhas onde o login tenha apenas letras e pontos.",
      path: "/filter-user"
    },
    {
      icon: Eye,
      title: "Manter Palavra-chave",
      description: "Mantém apenas linhas que contenham uma palavra específica.",
      path: "/keep-keyword"
    },
    {
      icon: CheckCheck,
      title: "Remover Checados",
      description: "Remove credenciais já verificadas, mantendo apenas as novas.",
      path: "/remove-checked"
    },
    {
      icon: Copy,
      title: "Remover Duplicatas",
      description: "Remove linhas duplicadas do texto.",
      path: "/remove-duplicates"
    },
    {
      icon: Search,
      title: "Remover Palavra-chave",
      description: "Remove linhas que contenham uma palavra específica.",
      path: "/remove-keyword"
    },
    {
      icon: Hash,
      title: "Remover Símbolos CPF",
      description: "Remove pontos e hífens antes do último ':'.",
      path: "/remove-cpf-symbols"
    },
    {
      icon: Link,
      title: "Remover URL",
      description: "Remove URLs e mantém apenas as senhas (após último ':').",
      path: "/remove-urls"
    }
  ];

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-4xl font-bold text-gradient mb-3">Bem-vindo ao MultiTools</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Processador de texto minimalista para dados no formato login:senha e listas gerais.
            Escolha uma ferramenta no menu lateral ou clique nos cards abaixo.
          </p>
        </div>

        {/* Quick Access Grid */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-6 fade-in-up">Acesso Rápido às Ferramentas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-fade">
            {tools.map((tool) => (
              <ToolCard
                key={tool.path}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                path={tool.path}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Index;
