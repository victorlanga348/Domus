# Task: Trava Contextual de Turno no Modal de Refeições
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`

---

## 1. Contexto & Problema
Quando o morador clica no botão `+ Adicionar` de um card de turno específico (ex: "Café da Manhã", "Almoço", etc.), o modal `EditMealModal` atualmente abre exibindo o campo "Horário / Turno" como um elemento `<select>` interativo contendo todas as 4 opções de refeições.

Como o usuário já clicou especificamente no card daquele turno, o contexto da refeição já foi definido. Manter um `<select>` editável gera poluição visual no formulário e propicia erros acidentais de clique (alterando inadvertidamente o turno pretendido).

---

## 2. Solução Proposta

1. **Propriedade de Bloqueio Contextual em `EditMealModal.tsx`:**
   - Adicionar a prop opcional `lockPeriod?: boolean` (padrão `true` quando acionado a partir de um card).
   - Localizar os metadados do turno selecionado (`currentPeriodMeta`) a partir de `mealPeriods`.

2. **Substituição do Seletor Interativo por Badge Fixo (Read-Only):**
   - Se `lockPeriod` for verdadeiro:
     * O elemento `<select>` interativo é removido.
     * É renderizado um componente fixo somente leitura (`read-only`), estilizado como badge/cartão com o ícone da refeição, nome do turno e faixa de horário (ex: "Café da Manhã (06:00 - 10:00)").
     * O estado interno `mealType` permanece estritamente vinculado ao turno de abertura (`defaultPeriod` ou `initialMeal.mealType`), sem permitir mutação.
   - Se `lockPeriod` for explicitamente `false` (por exemplo, num botão global genérico sem turno pré-determinado):
     * O elemento `<select>` interativo continua disponível.

3. **Integração em `MealsView.tsx`:**
   - Ao abrir o `EditMealModal` a partir dos cards do modo diário ou semanal, repassar `lockPeriod={true}`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  * Prevenção de erros humanos e cliques acidentais que trocariam o turno da refeição.
  * Formulário mais limpo, claro e objetivo.
  * Preservação da flexibilidade caso botões globais venham a ser adicionados no futuro (`lockPeriod={false}`).
- **Desvantagens / Riscos:**
  * Nenhuma desvantagem técnica identificada. Trata-se de melhoria ergonômica de UX/UI.

---

## 4. Critérios de Aceitação
- [x] No `EditMealModal`, ao abrir com `lockPeriod={true}` (padrão via card), o turno é exibido como badge/campo fixo de leitura com ícone, nome e horário.
- [x] O elemento `<select>` não é renderizado quando `lockPeriod` é ativo.
- [x] O estado `mealType` não sofre mutação pelo usuário no modal quando travado.
- [x] Caso `lockPeriod={false}` seja passado, o `<select>` continua funcional para todos os 4 turnos.
- [x] Validações `rtk npx tsc --noEmit` e `rtk npx vite build` executadas com sucesso sem regressões.
- [x] Testes automatizados executados e aprovados.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `frontend/src/features/meals/components/EditMealModal.tsx`:
   - Adicionar `lockPeriod?: boolean` à interface `EditMealModalProps` (default `true`).
   - Implementar renderização condicional do campo "Horário / Turno" (badge fixo com ícone e horário vs `<select>`).
2. Atualizar `frontend/src/features/meals/components/MealsView.tsx` repassando `lockPeriod={true}` para o `EditMealModal`.
3. Atualizar especificação em `docs/product/meals-menu.md` registrando a regra de bloqueio contextual do turno.
4. Executar checagens de tipos, build e testes unitários.
