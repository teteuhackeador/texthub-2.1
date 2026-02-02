
Objetivo (o que vai mudar)
- No **Filtrar Cloud** (modo “Criar Usuário:Senha”):
  - Remover o exemplo “inv” do placeholder do campo Usuário.
  - Trocar o título “Texto de Entrada” para **“Senhas”** (somente quando estiver nesse modo).
- Em **Filtrar Cloud** e em **todas as ferramentas que usam o componente `TextProcessor`**:
  - “Colar texto manualmente” vira o padrão (não mostrar o importador primeiro).
  - Adicionar um botão de **Importar** com ícone (Upload) ao lado do botão de **Limpar**, mantendo a mesma função atual (abrir o importador / alternar para a tela de importação).

Arquivos que vou inspecionar/alterar
- `src/pages/FilterCloud.tsx`
- `src/components/TextProcessor.tsx`

Mudanças detalhadas

1) Filtrar Cloud: campo Usuário sem exemplo “inv”
- Em `src/pages/FilterCloud.tsx`, no `<Input ... placeholder="ex: inv" />`:
  - Trocar para um placeholder neutro, por exemplo: `placeholder="Digite o usuário..."` (sem exemplo).

2) Filtrar Cloud: “Texto de Entrada” -> “Senhas” só no modo Usuário:Senha
- Em `src/pages/FilterCloud.tsx`, onde está:
  - `<CardTitle className="text-xl">Texto de Entrada</CardTitle>`
- Alterar para um título dinâmico:
  - Se `filterMode === "user:password"`: mostrar **“Senhas”**
  - Caso contrário: manter **“Texto de Entrada”**
- Motivo: nos outros modos a entrada é o JSON/linhas do cloud, então “Senhas” ficaria enganoso.

3) Filtrar Cloud: colar manualmente como padrão
- Em `src/pages/FilterCloud.tsx`:
  - Alterar `const [showManualInput, setShowManualInput] = useState(false);` para `useState(true);`
  - Alterar `clearInput()` para manter o padrão manual:
    - hoje: `setShowManualInput(false);`
    - novo: `setShowManualInput(true);`
- Resultado esperado:
  - Ao abrir a ferramenta (sem dados), já aparece a textarea para colar.
  - Se o usuário clicar em “Importar”, aí sim abre o `FileImporter`.

4) Filtrar Cloud: botão de Importar com ícone (Upload) ao lado da lixeira
- Em `src/pages/FilterCloud.tsx`:
  - Importar o ícone `Upload` do `lucide-react` junto com os outros ícones.
  - No bloco onde hoje existe o botão “Importar arquivo” (que só aparece quando `inputLineCount === 0` e `!useVirtualization`), manter a mesma lógica/ação (`onClick={() => setShowManualInput(false)}`), mas adicionar o ícone:
    - `<Upload className="w-4 h-4 mr-2" />`
  - Manter o texto do botão como está (“Importar arquivo”) para ficar claro.

5) TextProcessor (todas as ferramentas baseadas nele): colar manualmente como padrão
- Em `src/components/TextProcessor.tsx`:
  - Alterar `const [showManualInput, setShowManualInput] = useState(false);` para `useState(true);`
  - Alterar `clearInput()`:
    - hoje: `setShowManualInput(false);`
    - novo: `setShowManualInput(true);`
- Isso afeta automaticamente páginas como: Remover Duplicatas, Remover URLs, Filtrar CPF/Email/User/Numérico, etc., porque elas usam `TextProcessor`.

6) TextProcessor: adicionar ícone de Importar no botão que alterna para o importador
- Em `src/components/TextProcessor.tsx`:
  - Adicionar `Upload` no import do `lucide-react` (hoje só tem Trash2/Copy/Download).
  - No botão “Importar arquivo” (aquele que chama `setShowManualInput(false)`), inserir o ícone `<Upload ... />` antes do texto, mantendo exatamente o comportamento atual.

Checklist de testes (end-to-end)
- Filtrar Cloud:
  - Entrar em `/filter-cloud`, selecionar “Criar Usuário:Senha”.
  - Verificar:
    - Título do card de entrada agora é “Senhas”.
    - Campo Usuário não mostra mais “ex: inv”.
    - Ao abrir a página sem dados, já aparece a textarea (sem precisar clicar).
    - Botão “Importar arquivo” tem ícone e ao clicar abre o importador (FileImporter) como antes.
    - Botão “Limpar” volta para textarea (modo colar) como padrão.
- Ferramentas com `TextProcessor` (ex.: Remover Duplicatas):
  - Abrir a ferramenta e confirmar que a textarea aparece por padrão.
  - Confirmar que existe botão “Importar arquivo” com ícone que alterna para o FileImporter.
  - Confirmar que “Limpar” volta para a textarea (modo colar).

Riscos/observações
- Essa mudança não altera processamento nem workers; é somente UX/labels/estado inicial.
- O `FileImporter` continuará disponível (apenas deixa de ser a tela padrão).
