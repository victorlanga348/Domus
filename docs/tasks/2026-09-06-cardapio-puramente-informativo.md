# Task: Cardápio da Casa Puramente Informativo (Sem Atribuição de Responsáveis)
**Data:** 2026-09-06  
**Status:** Proposta  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
O módulo de Cardápio da Casa foi inicialmente construído com suporte a cozinheiros responsáveis (`chefs`) e gerador de escala semanal de rodízio.

No entanto, a necessidade real da casa é que o cardápio funcione como um **quadro informativo compartilhado** (o que vai ser servido, ingredientes, modo de preparo e restrições dietéticas) e **NÃO como tarefa direcionada ou escala de pessoas**. 

Manter o conceito de cozinheiro / escala gera ruído visual desnecessário, complexidade na interface e sobrecarga cognitiva para os moradores.

---

## 2. Solução Proposta

### Simplificação Cirúrgica do Módulo
1. **Refeição Informativa (`MealItem`):**
   - O objeto `MealItem` passa a focar estritamente no conteúdo gastronômico: `title` (prato), `description` (ingredientes/preparo), `tags` (restrições), `dayOfWeek` e `mealType`.
   - Remoção de `chefs`, `chefId`, `chefName`, `chefAvatar`.

2. **Modal de Cadastro / Edição (`EditMealModal`):**
   - Remoção da seção de seleção de cozinheiros responsáveis.
   - Interface mais limpa, ágil e focada: Dia, Turno, Nome do Prato, Detalhes/Ingredientes e Tags Dietéticas.

3. **Card da Refeição (`MealCard`):**
   - Remoção do footer com avatares/nomes de responsáveis.
   - Destaque total para o prato, descrição, badges de restrição e turno.

4. **Visão Principal (`MealsView`):**
   - Remoção do botão "Gerar Escala" e do modal de escala.
   - Mantida a **Trava Global (Lock Mode)** do Admin Geral e o botão **"Limpar Cardápio"** para governança.

5. **Estado Global (`App.tsx`):**
   - Remoção de `cookingSchedule`, `handleGenerateSchedule` e arquivo residual `GenerateScheduleModal.tsx`.
   - Limpeza de itens vazios no cardápio que tenham sido criados previamente sem título.

---

## 3. Análise de Trade-offs

### Vantagens
- **Simplicidade e Clareza:** O cardápio cumpre perfeitamente o papel de menu alimentar sem misturar lógica de tarefas da casa.
- **Menos código e manutenção:** Elimina ~400 linhas de código desnecessárias de wizard de escala e seleção de chefs.
- **UX mais rápida:** Adicionar ou editar um prato torna-se uma ação instantânea em 3 campos.

### Desvantagens / Riscos
- **Sem registro de quem cozinha:** Decisão intencional alinhada com o modelo da casa (a cozinha não é atribuída como tarefa).

---

## 4. Critérios de Aceitação
- [ ] `MealItem` focado em prato, descrição, tags, dia e turno (sem campos de cozinheiro)
- [ ] `EditMealModal` sem seletor de responsáveis
- [ ] `MealCard` limpo, sem avatares ou rodapé de chef
- [ ] `MealsView` sem botão de gerar escala e sem modal residual
- [ ] Trava Global (Lock Mode) e Limpar Cardápio continuam funcionando 100%
- [ ] `tsc --noEmit` ✅
- [ ] `vite build` ✅
- [ ] Testes de backend 35/35 ✅

---

## 5. Plano de Implementação (Passo a Passo)

1. **`frontend/src/types.ts`:**
   - Remover `MealChef` e campos de chef de `MealItem`.
2. **`frontend/src/features/meals/types.ts`:**
   - Remover `CookingScheduleConfig`, `onGenerateSchedule` e `savedCookingSchedule`.
3. **`frontend/src/features/meals/components/EditMealModal.tsx`:**
   - Remover `selectedChefIds`, `handleChefToggle` e a seção de seleção de cozinheiros.
4. **`frontend/src/features/meals/components/MealCard.tsx`:**
   - Remover footer com avatares e nomes de chefs.
5. **`frontend/src/features/meals/components/MealsView.tsx`:**
   - Remover botão "Gerar Escala" e `<GenerateScheduleModal>`.
6. **`frontend/src/features/meals/index.ts`:**
   - Remover export de `GenerateScheduleModal`.
7. **`frontend/src/features/meals/components/GenerateScheduleModal.tsx`:**
   - Remover arquivo.
8. **`frontend/src/App.tsx`:**
   - Remover `cookingSchedule`, `handleGenerateSchedule` e sanitizer de chefs.
9. **Validação & Testes:**
   - Executar `rtk npx tsc --noEmit`, `rtk npx vite build` e testes backend.
10. **Sincronização de Docs:**
    - Atualizar `docs/product/meals-menu.md`.
    - Atualizar esta task para Concluída.

---

## 6. Validação e Testes
- [ ] Typecheck / Lint sem erros (`rtk npx tsc --noEmit`)
- [ ] Build de produção executado com sucesso (`rtk npx vite build`)
- [ ] Testes backend 35/35 ✅ (`rtk npx tsx --test tests/unit/**/*.test.ts`)

---

## 7. Sincronização com /docs
- [ ] `docs/product/meals-menu.md` atualizado
- [ ] Matriz de impacto validada em [[docs/documentation-governance.md]]
