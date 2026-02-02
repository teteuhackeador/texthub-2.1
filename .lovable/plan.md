
Objetivo
- Corrigir a animação das categorias na sidebar para:
  1) Animar também ao ABRIR (hoje só está perceptível ao FECHAR).
  2) Ao FECHAR, desaparecer de BAIXO para CIMA (último item sai primeiro).
  3) Ao ABRIR, aparecer de CIMA para BAIXO (primeiro item entra primeiro).
  4) Manter o estilo clean e minimalista, sem “exageros”.

Diagnóstico (o porquê do comportamento atual)
- O Radix `CollapsibleContent` pode “não manter montado” o conteúdo quando está fechado (ou aplica `hidden/display` de forma que a transição de entrada não fica visível). Resultado: ao abrir, os itens “nascem” já no estado final e parece que aparece tudo junto; ao fechar, como eles já estão montados, dá para ver o stagger.
- O stagger atual usa sempre `transitionDelay: index * Xms`. Isso faz:
  - Abrir: top → bottom (ok).
  - Fechar: também top → bottom (errado para o que você quer), porque o item 0 sai primeiro.

Mudanças propostas (alto nível)
1) Garantir que a animação aconteça ao abrir
- Adicionar `forceMount` em `<CollapsibleContent ...>` para manter o DOM montado mesmo quando fechado, permitindo que:
  - O estado “closed” (opacity 0 / translate) exista antes do “open”
  - A transição “closed → open” fique visível e suave

2) Inverter a ordem do fechamento (bottom → top)
- Ajustar o `transitionDelay` por item de acordo com o estado da categoria:
  - Se a categoria está abrindo (`open === true`): delay = `index * STAGGER`
  - Se está fechando (`open === false`): delay = `(items.length - 1 - index) * STAGGER`
- Isso faz o último item (de baixo) sair primeiro, e o primeiro item (de cima) sair por último.

3) Manter o container sincronizado (sem “cortar” os itens)
- Manter o “accordion” (height) no `CollapsibleContent`, mas calibrar para combinar com o tempo total do stagger:
  - Duração do container (height) deve ser próxima do tempo total do stagger, para não fechar o “height: 0” antes de os últimos itens terminarem de animar.
  - Manter um pequeno `animation-delay` no fechamento do container (ou ajustar) para o container só começar a “encolher” depois que os itens começarem a sair (ou para não “engolir” a animação).

Detalhes técnicos (onde e como)
Arquivo: `src/components/AppSidebar.tsx`

A) CollapsibleContent
- Adicionar `forceMount`:
  - `<CollapsibleContent forceMount className="..." />`
- Revisar timings do container:
  - `data-[state=open]:animate-[accordion-down_XXXms_ease-out]`
  - `data-[state=closed]:[animation-delay:YYYms] data-[state=closed]:animate-[accordion-up_XXXms_ease-in]`
- Critério: `XXXms` deve cobrir aproximadamente `STAGGER*(n-1) + ITEM_DURATION` (n = qtd de itens da categoria “Filtrar”/“Remover” etc.). Exemplo:
  - ITEM_DURATION = 240–300ms
  - STAGGER = 60–90ms
  - Para 7 itens: total ~ 6*75 + 280 = 730ms → container ~ 700–800ms

B) SidebarMenuItem (stagger real por estado)
- Trocar o style atual:
  - de: `style={{ transitionDelay: \`\${index * 75}ms\` }}`
  - para: usar uma variável `delayMs` calculada usando `open` e `category.items.length`:
    - `const delayIndex = open ? index : (category.items.length - 1 - index)`
    - `transitionDelay: \`\${delayIndex * STAGGER}ms\``
- Manter as classes clean:
  - `transition-[transform,opacity] duration-280 ease-out will-change-transform`
  - `group-data-[state=open]/cat:translate-y-0 group-data-[state=open]/cat:opacity-100`
  - `group-data-[state=closed]/cat:-translate-y-1 group-data-[state=closed]/cat:opacity-0`

C) Acessibilidade/performance (opcional mas recomendado)
- Respeitar `prefers-reduced-motion`:
  - Em modo reduzido: remover stagger (delay 0) e reduzir/zerar as animações (ou deixar só fade rápido).

Sequência de implementação
1) Ajustar `CollapsibleContent` adicionando `forceMount`.
2) Implementar cálculo de delay condicional (open vs closed) em cada `SidebarMenuItem`.
3) Calibrar os timings do container (accordion) para não “comer” o stagger (principalmente no fechamento).
4) Testes manuais:
   - Abrir/fechar categorias com poucos itens (Adicionar/Manter) e com muitos (Filtrar/Remover).
   - Confirmar:
     - Abrir: itens entram um por vez de cima para baixo.
     - Fechar: itens saem um por vez de baixo para cima.
     - Mobile: clicar item fecha sidebar (continua ok) e não trava animação.
     - Modo collapsed: continua sempre aberto (sem flicker).

Critérios de pronto (o que você vai notar)
- Ao abrir uma categoria, dá para “ver” claramente cada item descendo/entrando em sequência.
- Ao fechar, o último item some primeiro, e a lista “recolhe” visualmente de baixo para cima.
- O movimento é suave, sem bounce/exagero, mantendo a estética clean atual.

Riscos/edge cases
- Se o Radix estiver aplicando `display: none`/`hidden` agressivamente, `forceMount` resolve na maioria dos casos; se ainda houver corte, ajustamos o delay do container no fechamento e/ou removemos o delay do container e deixamos só o stagger (dependendo do resultado).
- Se alguma categoria tiver itens dinâmicos no futuro, o cálculo por `category.items.length` continua correto.

Estimativa
- Implementação: 10–20 min
- Calibração visual (timings): 10–15 min (dependendo do “feeling” desejado)
