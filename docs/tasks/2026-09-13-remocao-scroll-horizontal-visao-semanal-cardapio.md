# Task: Remoção de Scroll Horizontal e Ajuste Fluido da Visão Semanal do Cardápio
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
A Visão Semanal do Cardápio estava utilizando uma largura mínima rígida (`min-w-[1190px]`) e container com `overflow-x-auto`, gerando barra de rolagem horizontal em telas de desktop/laptop comuns (1280px-1440px com sidebar lateral). O objetivo é eliminar totalmente o scroll lateral, ajustando a grade para caber 100% no viewport (`w-full grid-cols-7`) com todos os 7 dias visíveis simultaneamente.

---

## 2. Solução Proposta
1. **Grid 100% Fluido sem Scroll Lateral**:
   - Remover `overflow-x-auto` e `min-w-[1190px]` da Visão Semanal em `MealsView.tsx`.
   - Utilizar `w-full grid grid-cols-7 gap-1.5 sm:gap-2 xl:gap-2.5 2xl:gap-3`.
   - Expandir a largura máxima do container geral (`max-w-full` ou `max-w-[1600px]`) para aproveitar todo o espaço útil do layout desktop.
2. **Densidade e Tipografia Micro-Otimizada no `MealCard` (`compact`)**:
   - Ajustar o padding interno dos cards para `p-2 xl:p-2.5`.
   - Ícones de turno em `20px-22px` (`w-5 h-5`).
   - Títulos de turno e prato com tipografia responsiva (`text-[11px] xl:text-xs font-black`).
   - Horários em linha compacta (`text-[9px] xl:text-[10px] font-semibold text-[#727877]`).
   - Tags dietéticas compactas (`text-[8px] xl:text-[9px] px-1 py-0.5`).
3. **Colunas de Dias Compactas e Elegantes**:
   - Cabeçalhos de coluna com `p-1.5 xl:p-2`, `day.mediumLabel` e badge de contagem sem quebras.

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Visão 100% panorâmica imediata de Segunda a Domingo sem nenhuma rolagem lateral.
  - Otimização do espaço de tela no desktop, aumentando a produtividade visual do morador.
- **Desvantagens / Riscos:** 
  - Exige proporções precisas de fontes e paddings para evitar que pratos com nomes longos ocupem mais de 2 linhas.

---

## 4. Critérios de Aceitação
- [x] Nenhum scroll horizontal é exibido na Visão Semanal em desktops e laptops.
- [x] Todas as 7 colunas (Segunda a Domingo) aparecem simultaneamente na tela.
- [x] Todos os títulos de turnos e pratos continuam legíveis e bem formatados.
- [x] Typecheck e build passam sem erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Ajustar `frontend/src/features/meals/components/MealsView.tsx`**:
   - Remover `min-w-[1190px]` e `overflow-x-auto pb-4`.
   - Ajustar grid para `grid-cols-7 gap-1.5 sm:gap-2 xl:gap-2.5 w-full`.
   - Ajustar container pai para `max-w-[1600px] px-2 sm:px-4 lg:px-6`.
2. **Ajustar `frontend/src/features/meals/components/MealCard.tsx`**:
   - Otimizar paddings (`p-2 xl:p-2.5`), tamanhos de ícones (`w-5 h-5`) e fontes responsivas (`text-[11px] xl:text-xs`).
3. **Testes & Validação**:
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
4. **Sincronização de Docs**:
   - Atualizar `docs/product/meals-menu.md`.
