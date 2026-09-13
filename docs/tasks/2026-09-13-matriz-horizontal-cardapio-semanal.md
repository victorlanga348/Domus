# Task: Matriz Horizontal para Visão Semanal do Cardápio da Casa
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
A disposição anterior em 7 colunas verticais estreitas resultava em colunas de apenas ~140px de largura útil, causando compressão extrema dos cards de refeição e falta de espaço para descrições, tags e títulos de pratos. Para resolver definitivamente esse problema de espaço sem introduzir rolagem horizontal, a Visão Semanal será remodelada para a arquitetura de **Matriz Horizontal**.

---

## 2. Solução Proposta
1. **Arquitetura de Matriz Horizontal (Linhas = Dias, Colunas = 4 Refeições)**:
   - **Cabeçalho Fixo da Matriz:** 
     - Coluna de Dia (~150px): Exibe o Dia da Semana (`Segunda-feira`, `Terça-feira`...), badge do dia de `Hoje` e contagem de pratos cadastrados.
     - 4 Colunas de Refeições (~250px a 320px cada):
       - Café da Manhã (`breakfast`) com faixa de horário configurável.
       - Almoço (`lunch`) com faixa de horário configurável.
       - Lanche / Sobremesa (`snack`) com faixa de horário configurável.
       - Jantar (`dinner`) com faixa de horário configurável.
   - **Linhas dos 7 Dias:** Cada dia da semana ocupa uma linha horizontal espaçosa, com as 4 células de refeição dispostas lado a lado.
   - **Destaque do Dia Atual:** A linha correspondente ao dia de hoje recebe destaque visual diferenciado (borda sutil `#16302e`, fundo claro `#F4F9F7` e badge `Hoje`).
2. **Células de Refeição Espaçosas & Ricas**:
   - Cada célula tem largura livre (~250px-300px), permitindo:
     - Título do prato destacado (`text-sm font-black text-[#16302e]`).
     - Descrição completa ou ingredientes (`text-xs text-[#727877] line-clamp-2`).
     - Tags dietéticas visíveis com ícones e cores completas.
     - Botão de edição contextual e ação rápida de cadastro.
3. **Preservação Integral de Permissões e Modais**:
   - Mantém as regras de edição para Admin Geral e Sub-Admin (quando destrancado), trava global de cardápio, e modais de edição com bloqueio contextual de turno (`lockPeriod: true`).

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Espaço horizontal mais de 2.5x maior por refeição (de ~140px para ~280px).
  - Leitura natural de cima para baixo acompanhando o fluxo dos dias da semana.
  - Zero rolagem horizontal em qualquer resolução de desktop/laptop.
  - Títulos de pratos ("Hambúrguer com Queijo e Ovo"), tags e descrições sem truncamento.
- **Desvantagens / Riscos:** 
  - O conteúdo vertical da página semanal será maior, utilizando a rolagem natural da janela (comportamento padrão e desejado para tabelas/matrizes).

---

## 4. Critérios de Aceitação
- [x] A Visão Semanal renderiza em formato de Matriz com linhas de dias (Segunda a Domingo) e 4 colunas de refeições.
- [x] Cada turno possui espaço amplo (>= 220px) sem nenhum truncamento de texto ou esmagamento visual.
- [x] A linha do dia atual (`Hoje`) é claramente destacada na matriz.
- [x] As ações de adicionar, editar prato e ajustar horários de turno funcionam perfeitamente.
- [x] A Visão Diária e Visão Mobile permanecem 100% funcionais e responsivas.
- [x] Typecheck e build passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Ajustar `frontend/src/features/meals/components/MealsView.tsx`**:
   - Substituir o grid vertical de 7 colunas por uma Matriz em Linhas:
     - Cabeçalho das 4 refeições com badges e horários globais.
     - Mapeamento das 7 linhas de dias (Segunda a Domingo).
     - Destaque na linha de hoje (`initialDayKey`).
2. **Criar / Ajustar Componente de Célula de Matriz ou Modo `matrix` no `MealCard.tsx`**:
   - Célula elegante com espaço para título, descrição, tags dietéticas e botões de ação sem esmagamento.
3. **Validação Técnica**:
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
4. **Sincronização de Documentação**:
   - Atualizar `docs/product/meals-menu.md` refletindo o novo padrão de Matriz Horizontal Semanal.
