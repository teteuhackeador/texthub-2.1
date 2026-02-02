
## Objetivo
Eliminar de vez o “efeito fantasma” onde, ao alternar a sidebar no desktop (mini ↔ normal), as categorias aparecem abertas e imediatamente rodam a animação de fechar (mesmo já estando fechadas no estado salvo).

## Diagnóstico (por que está acontecendo)
Hoje, no modo **mini (collapsed)**, o código força:
- `open = true` para todas as categorias (`const open = collapsed ? true : openByCategory[...]`)

Quando você volta para **normal (expanded)**, algumas categorias deveriam estar fechadas (pelo `openByCategory`), então o `open` muda de `true → false`. Como o `CollapsibleContent` está `forceMount`, o Radix aplica `data-state=closed` e o CSS de transição de altura + stagger dispara uma **animação real de fechamento**.

A tentativa atual de “matar animação por 1 tick” (`motionReady` + `useEffect`) às vezes falha porque `useEffect` roda **depois do paint**. Ou seja: dá tempo do navegador pintar 1 frame com transições ativas e começar o fechamento; só depois o effect corta a animação (isso bate com o comportamento intermitente que você descreveu).

## Estratégia de correção (o que vamos mudar)
### 1) Trocar a supressão de animação de `useEffect` para `useLayoutEffect` no desktop
- Vamos reagir à mudança `collapsed ↔ expanded` em **useLayoutEffect** (não useEffect).
- `useLayoutEffect` roda **antes do browser pintar**, então conseguimos:
  1) colocar `motionReady = false` imediatamente (antes do frame que iniciaria a animação),
  2) deixar o React/DOM aplicar o novo layout (largura da sidebar + estados open/closed),
  3) só então reabilitar `motionReady = true` (com 2 rAFs como já fazemos).

Resultado esperado: ao alternar mini ↔ normal, as categorias já “nascem” no estado certo (abertas/fechadas), sem rodar transição de fechamento.

### 2) Consolidar o “kill switch” de animação em um único “motion gate”
Hoje o gate é só `motionReady`. Vamos deixar isso mais determinístico:
- Criar um `motionGateRef` / `isTransitioningSidebarRef` (ref booleana) que fica `true` durante a troca mini ↔ normal.
- Computar `animationsEnabled` como:
  - `motionReady && !isTransitioningSidebarRef.current`
- Esse ref evita casos onde `motionReady` volta a `true` cedo demais em alguma re-renderização.

### 3) Garantir que o “toggle mini ↔ normal” não dispara fechamento em cascata por re-render extra
- Revisar dependências dos effects para evitar re-execução “desnecessária” durante a troca.
- Confirmar que `suppressMotionForATick` não depende de valores que mudem e causem re-render em cadeia.
- Manter cancelamento de rAFs (já existe) para evitar “re-enable” tardio.

## Arquivos que serão mexidos
- `src/components/AppSidebar.tsx`
  - Importar `useLayoutEffect`
  - Substituir o effect que escuta `collapsed` (desktop) por `useLayoutEffect`
  - Ajustar `animationsEnabled` para levar em conta um “transition flag” via ref
  - (Opcional) aplicar o mesmo padrão no effect do mobile por consistência, mas o alvo principal é desktop.

## Critérios de aceite (testes manuais bem objetivos)
1) Desktop:
   - Feche, por exemplo, “Filtrar” e “Remover”.
   - Deixe a sidebar em modo normal.
   - Clique para virar mini.
   - Clique para voltar ao normal.
   - Esperado: “Filtrar” e “Remover” já aparecem fechadas imediatamente, **sem animar fechando**.
2) Ainda no desktop:
   - Clique para abrir/fechar manualmente uma categoria.
   - Esperado: animação de abrir e a animação de fechar continuam do jeito “perfeito” que você aprovou (stagger bottom→top no fechar, com altura colapsando no timing certo).
3) Repetir o ciclo mini ↔ normal umas 10 vezes rápido.
   - Esperado: zero ocorrência intermitente do bug.

## Observações técnicas (para garantir que não quebre nada)
- `useLayoutEffect` pode rodar apenas no client; em Vite/React SPA isso é ok.
- O `forceMount` continua (ele é útil para medir altura e manter layout estável), só vamos impedir a transição fantasma no momento da troca mini ↔ normal.
- Não vamos remover nenhuma animação: só impedir que rode quando a mudança é “estrutural” (toggle da sidebar), não uma intenção do usuário de fechar a categoria.

