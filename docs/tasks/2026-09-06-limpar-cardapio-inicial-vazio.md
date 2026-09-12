# Task: Esvaziamento de Dados Iniciais do Cardápio & Ação de Limpeza
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/meals-menu.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
O módulo de Cardápio da Casa foi inicializado anteriormente com dados mock de exemplo (refeições pré-preenchidas para todos os dias da semana). O usuário solicitou que o cardápio inicie totalmente vazio (`meals: []`), permitindo que os moradores insiram seus próprios pratos reais do zero, sem resquícios de dados de demonstração.

---

## 2. Solução Proposta
1. **Reset do Gerador Padrão (`types.ts`):**  
   Refatorar `createDefaultMealPlan(houseId)` para retornar `meals: []` limpo por padrão.
2. **Ação "Limpar Cardápio" (`MealsView.tsx` & `App.tsx`):**  
   Adicionar botão para esvaziar todas as refeições cadastradas (quando houver itens e o usuário possuir permissão `canEdit`), com modal de confirmação para prevenir limpezas acidentais.
3. **Limpeza de Armazenamento Local:**  
   Garantir que residências recém-iniciadas ou sob ação de limpeza persistam `meals: []` no `localStorage`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Tela pronta para uso real imediato pelos moradores, sem necessidade de apagar manualmente prato por prato.
  - O botão "Limpar Cardápio" permite reiniciar o ciclo de planejamento semanal com 1 clique a qualquer momento.
- **Desvantagens / Riscos:**
  - Limpeza acidental de pratos já preenchidos.
  - *Mitigação:* Exigir confirmação explícita antes de resetar os pratos.

---

## 4. Critérios de Aceitação
- [x] `createDefaultMealPlan` retorna `meals: []` vazio.
- [x] Botão de "Limpar Cardápio" disponível no cabeçalho do módulo quando existirem pratos cadastrados e `canEdit` for verdadeiro.
- [x] Modal de confirmação antes de executar o esvaziamento.
- [x] Persistência imediata de `meals: []` no `localStorage` da residência e emissão via WebSocket.
- [x] Build (`rtk npm run build`) e typecheck (`rtk npm run typecheck`) com 0 erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Refatoração de `createDefaultMealPlan` (`frontend/src/features/meals/types.ts`):**
   - Retornar `{ houseId, isLocked: false, meals: [] }`.
2. **Integração de `onClearMeals` (`MealsView.tsx` e `App.tsx`):**
   - Criar handler `handleClearMeals` em `App.tsx`.
   - Adicionar botão de ação e modal de confirmação em `MealsView.tsx`.
3. **Validação & Testes:**
   - Executar `rtk npm run typecheck` e `rtk npm run build`.
4. **Sincronização de Docs & Commit:**
   - Atualizar status para Concluída e realizar commit atômico em português.

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run typecheck`)
- [x] Build do frontend (`rtk npm run build`)
- [x] Verificação de estado inicial vazio e funcionamento da ação de limpeza

---

## 7. Sincronização com /docs
- [x] `docs/tasks/2026-09-06-limpar-cardapio-inicial-vazio.md`
- [x] `docs/product/meals-menu.md`
