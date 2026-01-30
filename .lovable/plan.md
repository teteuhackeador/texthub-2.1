
Objetivo
- Fazer o texto da opção da sidebar realmente aumentar ao passar o mouse (hoje só muda o fundo para cinza).
- Manter: apenas o item em hover aumenta (não todos).
- Manter: aumento “de baixo para cima” (transform origin no bottom).

O que eu encontrei (causa mais provável)
- No shadcn sidebar, o `SidebarMenuButton` aplica automaticamente no item classes como `overflow-hidden` (veja `src/components/ui/sidebar.tsx`, `sidebarMenuButtonVariants`).
- Como você está usando `<SidebarMenuButton asChild>`, essas classes são aplicadas diretamente no seu `<NavLink>`.
- Quando tentamos dar `scale` no texto, ele tenta “crescer” para fora do container, mas o `overflow-hidden` do `<NavLink>` corta (clip) o conteúdo. Resultado visual: você percebe o highlight cinza, mas o texto parece não aumentar.

Solução (abordagem)
1) Sobrescrever o `overflow-hidden` do item do menu
- Em `src/components/AppSidebar.tsx`, no `NavLink` (que está dentro de `SidebarMenuButton asChild`), adicionar `overflow-visible` (idealmente no final do className para “ganhar” na prioridade).
- Se ainda existir conflito de ordem, usar a variante importante do Tailwind: `!overflow-visible`.

2) Garantir que o elemento que escala fique “por cima” e ancorado embaixo
- Manter o “grupo nomeado” para isolar hover:
  - `NavLink` com `group/navitem`
  - Elemento do texto com `group-hover/navitem:scale-110`
- No wrapper do texto (o `div` que você criou), manter:
  - `origin-bottom` (crescer de baixo para cima)
  - `inline-block` + `transition-transform` + `will-change-transform`
- Se necessário para garantir visibilidade, adicionar:
  - `relative` no wrapper do texto
  - `z-10` no wrapper do texto
  (isso evita que o texto escalado pareça “por baixo” do container em algumas combinações de stacking)

3) Checklist de validação (rápido)
- Hover em “Início”: só “Início” cresce; “Dividir em Partes” e “HAR Reducer” não crescem.
- Crescimento percebido “para cima” (origin-bottom).
- Testar também em rotas longas como `/filter-intelx` (onde você está) e com sidebar colapsada/expandida.

Arquivos a alterar
- `src/components/AppSidebar.tsx`

Mudanças exatas (o que será editado)
- No `NavLink` (className), acrescentar algo como:
  - `overflow-visible` (ou `!overflow-visible`) no final
- (Opcional, se ainda não aparecer) No wrapper do texto:
  - adicionar `relative z-10`

Riscos / Observações
- Tornar `overflow-visible` pode permitir que o texto “invada” um pouco a área ao lado durante o hover. Em geral isso é desejado aqui, porque o objetivo é ver a escala.
- Se você achar o efeito forte demais, podemos trocar `scale-110` por `scale-105` depois que funcionar.

Critérios de aceite
- Ao passar o mouse em um item, apenas aquele item aumenta de tamanho.
- O crescimento ocorre a partir de baixo (origin-bottom).
- O hover continua mostrando o destaque cinza como hoje, mas agora com escala visível.
