
Objetivo
- Fazer as categorias da sidebar (Geral/Filtrar/Adicionar/Manter/Remover) serem “clicáveis”: ao clicar, a lista de opções recolhe; ao clicar de novo, expande.
- Adicionar uma animação suave de abrir/fechar.
- Manter o comportamento atual no modo “mini” (sidebar recolhida só com ícones): sempre mostrar os ícones (não colapsar grupos nesse modo), conforme sua escolha.

O que eu encontrei no código atual
- A sidebar é baseada no componente shadcn em `src/components/ui/sidebar.tsx` e a navegação está em `src/components/AppSidebar.tsx`.
- Hoje cada categoria é renderizada como:
  - `SidebarGroup` + `SidebarGroupLabel` (apenas texto)
  - `SidebarGroupContent` com o `SidebarMenu` (sempre visível)
- Já existe Radix Collapsible em `src/components/ui/collapsible.tsx` (wrapper simples), o que facilita implementar expand/retract com animação.
- O Tailwind já tem keyframes `accordion-down`/`accordion-up` no `tailwind.config.ts` (usados no Accordion). Podemos reutilizá-los com o Collapsible, porque ele também expõe `data-state="open|closed"`.

Decisão de implementação (comportamentos confirmados por você)
- “Várias abertas”: cada categoria terá estado independente (não é accordion).
- “Pode fechar ativa”: mesmo que a rota atual esteja dentro, ainda pode fechar manualmente.
- “Sempre mostrar ícones” no modo mini: quando `state === "collapsed"`, os grupos ficarão sempre “abertos” visualmente (ícones aparecendo) e o clique no título da categoria não será usado.

Mudanças planejadas (alto nível)
1) Transformar cada categoria em um Collapsible
- Em `AppSidebar.tsx`, envolver cada `SidebarGroup` em um `<Collapsible>` (Radix).
- Substituir o label atual por um trigger clicável quando a sidebar estiver expandida.

2) Adicionar animação de abrir/fechar
- Usar `CollapsibleContent` e aplicar classes com base no `data-state`:
  - `overflow-hidden`
  - `data-[state=open]:animate-accordion-down`
  - `data-[state=closed]:animate-accordion-up`
- Isso reaproveita os keyframes já presentes no Tailwind.

3) UI do “título da categoria” como botão
- Quando a sidebar estiver expandida:
  - `SidebarGroupLabel` vira um botão/trigger (usando `CollapsibleTrigger asChild`) com estilo semelhante ao atual, mas com affordance de clique.
  - Adicionar ícone de seta (ex: `ChevronDown`) que gira ao abrir (ex: `group-data-[state=open]:rotate-180` ou equivalente via data-attributes do Radix).
- Quando a sidebar estiver recolhida (mini):
  - Manter como hoje: label escondido (`!collapsed && category.label`).
  - Forçar conteúdo aberto para não “sumir” os ícones por grupo.

4) Estado (aberto/fechado) por categoria
- Implementar um `useState<Record<string, boolean>>` em `AppSidebar.tsx` (chave = `category.label`).
- Valores iniciais:
  - Quando expandida: começar com todas abertas (ou manter um padrão simples: todas abertas).
  - Quando recolhida: renderizar com `open={true}` (ignorando o estado) para sempre mostrar ícones.
- Atualização:
  - Clique no trigger alterna apenas a categoria clicada.

Arquivos que serão alterados
- `src/components/AppSidebar.tsx`
  - Importar `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` de `@/components/ui/collapsible`
  - Importar `ChevronDown` do `lucide-react`
  - Refatorar o map de `menuCategories` para usar Collapsible e o estado por categoria
  - Adicionar classes de animação no conteúdo colapsável

Detalhe técnico (como ficará a estrutura por categoria)
- Estrutura alvo (simplificada):

```text
Collapsible (open={...} onOpenChange={...})
  SidebarGroup
    CollapsibleTrigger (asChild)
      SidebarGroupLabel (vira botão clicável quando expanded)
        "Filtrar" + ChevronDown (rotaciona)
    CollapsibleContent (anima altura)
      SidebarGroupContent
        SidebarMenu (itens)
```

Animações e classes (resumo)
- `CollapsibleContent`:
  - `className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"`
- Trigger/label:
  - `className="cursor-pointer select-none ..."` (mantendo tipografia e cores atuais)
  - `ChevronDown` com `transition-transform` e rotação baseada em `data-state`.

Critérios de aceite (o que você vai ver na tela)
- Sidebar expandida:
  - Clicar em “Filtrar” recolhe/expande apenas os itens de “Filtrar”.
  - Animação suave no abrir/fechar.
  - Outras categorias permanecem como estão (várias podem ficar abertas).
- Sidebar mini (recolhida):
  - Ícones continuam aparecendo (sem “sumir” por categoria).
  - A funcionalidade de recolher categorias não atrapalha a navegação nesse modo.

Plano de teste (rápido)
- Desktop:
  - Abrir/fechar 2-3 categorias diferentes e confirmar que a animação funciona.
  - Alternar a sidebar entre expandida/recolhida e confirmar que no modo mini os ícones continuam visíveis.
- Mobile:
  - Abrir sidebar, recolher/expandir categorias, clicar em um item e confirmar que a sidebar mobile fecha (já existe `setOpenMobile(false)`).

Riscos / observações
- Se a animação “accordion” (0.2s) ficar rápida/lenta demais, ajustaremos a duração no Tailwind (ou aplicaremos `duration-300` no conteúdo), mas primeiro vou manter consistente com o restante do projeto.
- Como você escolheu “pode fechar ativa”, não vou forçar abrir automaticamente a categoria que contém a rota atual (mas isso pode ser adicionado depois como opção).

Próximo passo
- Após sua aprovação, eu implemento a refatoração em `AppSidebar.tsx` seguindo os passos acima e valido no preview.