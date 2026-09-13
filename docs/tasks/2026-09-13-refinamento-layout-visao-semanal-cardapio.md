# Task: Refinamento de Layout e Responsividade da Visão Semanal do Cardápio
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
Na tela do **Cardápio da Casa** (`MealsView.tsx`), ao alternar para a **Visão Semanal** em desktops e laptops comuns (viewports entre 1024px e 1440px), o grid de 7 colunas fica comprimido (`min-w-[980px]`), resultando em colunas com ~125px-135px de largura útil. Isso acarreta:
1. Truncamento severo de nomes de turnos de refeição (`C... da M...`, `A...`).
2. Quebra inadequada de palavras nos cabeçalhos dos dias (`Segunda-` quebrando em linha separada de `feira`).
3. Congestionamento no header de cada card (`MealCard.tsx`), onde ícone, título, horário com link e botão de edição disputam uma única linha horizontal.
4. Nomes de pratos e descrições com quebras e cortes excessivos.

---

## 2. Solução Proposta
1. **Dimensionamento do Grid Semanal**:
   - Ajustar a largura mínima global do grid semanal para `min-w-[1190px]` (`~165px` por coluna) com rolagem horizontal fluida e estilizada (`overflow-x-auto pb-3`), preservando a integridade das 7 colunas sem esmagamento.
2. **Nomenclatura Inteligente dos Cabeçalhos**:
   - Utilizar nomes de dias limpos (`Segunda`, `Terça`, `Quarta`, `Quinta`, `Sexta`, `Sábado`, `Domingo`) ou abreviações responsivas, evitando quebras de hífen.
3. **Reestruturação do `MealCard` em Modo `compact`**:
   - Organizar o cabeçalho do card em duas camadas verticais no modo compacto:
     - **Linha 1:** Ícone (24px) + Título do Turno (`text-xs font-black`) + Botão de Ação / Edição (`top-right`).
     - **Linha 2:** Linha/Badge de horário (`text-[10px] font-semibold text-[#727877]`) com clique para ajuste de turnos.
   - Otimizar o corpo do card para texto de pratos e descrições (`text-xs font-black` para título, `text-[10px]` para descrição) e tags (`text-[9px]`).
4. **Preservação de Todas as Regras de Negócio e Permissões**:
   - Manter idênticas as regras de trava (`isLocked`), permissões de Admin Geral / Sub-Admin / Residente, e modais contextuais com trava de turno.

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Legibilidade total de todos os turnos ("Café da Manhã", "Almoço", "Lanche / Sobremesa", "Jantar") sem nenhum truncamento (`...`).
  - Layout visual de alta fidelidade e acabamento profissional.
  - Navegação suave e sem quebras de layout em telas de qualquer proporção (incluindo laptops 13" e 15").
- **Desvantagens / Riscos:** 
  - Em viewports menores que 1400px com sidebar expandida, o usuário utilizará rolagem horizontal suave no grid semanal (comportamento padrão e desejado para Kanbans de 7 colunas).

---

## 4. Critérios de Aceitação
- [x] O título de nenhuma refeição ("Café da Manhã", "Almoço", "Lanche / Sobremesa", "Jantar") fica truncado ou cortado na Visão Semanal.
- [x] O cabeçalho dos dias da semana não quebra palavras ou hífens indevidamente.
- [x] O horário e o botão de edição de cada refeição ficam ergonomicamente posicionados sem sobreposição de elementos.
- [x] A Visão Diária e a Visão Mobile continuam operando com 100% de estabilidade e estética.
- [x] Testes de compilação, linter e build passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Atualizar `frontend/src/features/meals/types.ts`**:
   - Adicionar `mediumLabel` em `DAYS_OF_WEEK` (`Segunda`, `Terça`, `Quarta`, `Quinta`, `Sexta`, `Sábado`, `Domingo`).
2. **Ajustar `frontend/src/features/meals/components/MealCard.tsx`**:
   - Reestruturar o header para modo `compact`: Linha 1 (ícone + título + botão de editar/lock) e Linha 2 (horário de agendamento).
   - Refinar tamanhos de fonte, espaçamento interno (`p-3`) e quebra de texto dos pratos e tags.
3. **Ajustar `frontend/src/features/meals/components/MealsView.tsx`**:
   - Atualizar a grid semanal para `min-w-[1190px]` com espaçamento proporcional (`gap-2.5` ou `gap-3`).
   - Usar `day.mediumLabel || day.fullLabel` no cabeçalho das colunas do Kanban semanal.
4. **Validações Técnicas**:
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
5. **Sincronização de Docs**:
   - Atualizar `docs/product/meals-menu.md` com as especificações de densidade e layout do modo semanal.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`frontend` e `backend`)
- [x] Build de frontend executado com sucesso (`vite build`)
- [x] Inspeção visual da responsividade e espaçamento

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` atualizado
- [x] Matriz de impacto validada em `docs/documentation-governance.md`
