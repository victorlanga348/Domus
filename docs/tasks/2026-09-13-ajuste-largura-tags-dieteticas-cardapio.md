# Task: Eliminação de Truncamento Artificial em Tags Dietéticas do Cardápio
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
Tags dietéticas e contextuais mais longas, como "Especial da Casa" (16 caracteres) e "Rápido (<20min)" (15 caracteres), estavam sendo truncadas com reticências (`...`) dentro dos cards de refeição (`MealCard.tsx` e `MealsView.tsx`), mesmo quando havia amplo espaço horizontal disponível dentro do card/célula.

A causa raiz era a presença de limites artificiais fixos (`max-w-[80px]` em `MealCard.tsx` e `max-w-[100px]` em `MealsView.tsx`) no `<span>` do texto das tags.

---

## 2. Solução Proposta
Aumentar o limite de largura máxima das tags para `max-w-[160px]`, garantindo que tags compostas como "Especial da Casa", "Opção Vegetariana" ou "Rápido (<20min)" sejam renderizadas por completo sem truncamento e com quebra de linha fluida (`flex-wrap`).

---

## 3. Análise de Trade-offs
- **Vantagens:** 
  - Legibilidade total de todos os tipos de tags dietéticas e de destaque.
  - Elimina cortes prematuros de texto onde existe espaço horizontal abundante.
- **Desvantagens / Riscos:** 
  - Nenhum risco técnico ou regressão funcional.

---

## 4. Critérios de Aceitação
- [x] A tag "Especial da Casa" é exibida por completo sem reticências (`...`) na Visão Diária e na Visão Semanal.
- [x] Todas as demais tags da lista oficial mantêm exibição íntegra.
- [x] Em cartões menores ou com múltiplas tags, o container executa quebra fluida (`flex-wrap`) sem transbordar o card.
- [x] Testes de typecheck e build de produção passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Ajustar o `<span>` do texto das tags em `frontend/src/features/meals/components/MealCard.tsx` para `max-w-[160px]`.
2. Ajustar o `<span>` do texto das tags em `frontend/src/features/meals/components/MealsView.tsx` para `max-w-[160px]`.
3. Executar typecheck e build do frontend com `rtk`.
4. Atualizar o documento de tarefa e governança em `/docs`.
5. Registrar o commit em português.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npm run typecheck`)
- [x] Build executado com sucesso (`rtk npm run build`)
- [x] Validação visual da renderização de tags longas

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` revisado.
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md).
