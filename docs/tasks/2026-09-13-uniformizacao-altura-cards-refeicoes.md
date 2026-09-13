# Task: Uniformização de Altura dos Cards de Refeição (Visão Diária)
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`, `[[docs/components/overview.md]]`

---

## 1. Contexto & Problema
Na Visão Diária do Módulo de Cardápio (`MealsView.tsx`), os 4 cards de refeições (Café da Manhã, Almoço, Lanche / Sobremesa, Jantar) são organizados em um CSS Grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

Quando um dos cards possui conteúdo adicional (como tags dietéticas `Especial da Casa`, descrições longas ou botões extras), a célula da linha do Grid se expande para acomodar a maior altura. No entanto, o elemento raiz interno do componente `MealCard` não possuía `h-full` / `w-full`, fazendo com que os cards com menos conteúdo (ou no estado vazio) mantivessem apenas a altura mínima intrínseca (`min-h-[160px]`), gerando uma discrepância visual de alturas na mesma linha do grid.

---

## 2. Solução Proposta
Adicionar explicitamente as classes de utilitário `h-full w-full` no elemento `<div ...>` raiz do componente `MealCard.tsx`. Dessa forma, todos os cards preenchem uniformemente a altura total da célula do grid calculada pelo navegador, mantendo o cabeçalho no topo, o conteúdo centralizado (`flex-1`) e as tags/ações alinhadas na base inferior.

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Alinhamento visual impecável e consistente entre todos os 4 cards da linha.
  - O design mantém equilíbrio estético tanto com 0, 1 ou múltiplas tags dietéticas.
  - Zero alteração no contrato de dados, estado ou renderização condicional.
- **Desvantagens / Riscos:** 
  - Nenhum risco de regressão funcional.

---

## 4. Critérios de Aceitação
- [x] Todos os 4 cards de refeição na Visão Diária possuem a mesma altura uniforme na linha do grid.
- [x] O rodapé de tags e ações permanece alinhado na base inferior em todos os cards preenchidos.
- [x] O estado vazio ("Nenhum prato" + "+ Adicionar") permanece centralizado e esticado harmoniosamente.
- [x] Testes de typecheck e build de frontend passam sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar o container raiz de `frontend/src/features/meals/components/MealCard.tsx` incluindo `h-full w-full`.
2. Executar `rtk npm run typecheck` e `rtk npm run build`.
3. Atualizar a documentação em `docs/product/meals-menu.md`.
4. Registrar o commit em português conforme as diretrizes do projeto.

---

## 6. Validação e Testes
- [x] Typecheck / Lint sem erros (`rtk npm run typecheck`)
- [x] Build de produção executado com sucesso (`rtk npm run build`)
- [x] Validação da renderização visual uniforme

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` atualizado com a diretriz de altura uniforme (equal-height) nos cards.
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md).
