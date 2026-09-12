# Task: Simplificação do Card de Refeição, Edição Direta de Horários e Body Scroll Lock em Modais
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/meals-menu.md]]`, `[[docs/components/sidebar-header.md]]`

---

## 1. Contexto & Problema
1. **Redundância de Ações (Botões Duplicados):** Quando um período não possui prato cadastrado (`hasMeal === false`), o card exibe tanto um botão de `+` no canto superior direito do cabeçalho quanto um botão `+ Adicionar` no centro do card. Ambos disparam rigorosamente a mesma ação (`onEdit`), gerando poluição visual desnecessária.
2. **Edição Direta de Horário pelo Admin / Admin Geral:** O horário de cada refeição (ex: `06:00 - 10:00`) é exibido como texto estático no cabeçalho do card. O usuário (Admin Geral / Admin) deseja poder clicar diretamente no horário da refeição para editar a faixa de horário daquele turno rapidamente.
3. **Vazamento de Scroll de Fundo em Modais/Pop-ups (Background Scroll Leaking):** Ao abrir modais, drawers ou pop-ups na aplicação, a rolagem da página ao fundo continua ativa, prejudicando a experiência de navegação (especialmente em dispositivos móveis e touch).

---

## 2. Solução Proposta

1. **Eliminação da Duplicação de Ações no `MealCard`:**
   - Quando **não houver prato definido** (`!hasMeal`):
     - Ocultar o botão `+` do topo direito do card.
     - Manter exclusivamente a ação no corpo central (`+ Adicionar`), com área de clique confortável e limpa.
   - Quando **houver prato definido** (`hasMeal`):
     - Exibir no topo direito o botão de edição `edit` (ícone de lápis) para alterar o prato cadastrado.

2. **Edição de Horários Direta ao Clicar no Horário do Card:**
   - Adicionar o callback `onEditSchedule?: (mealType: MealType) => void` no `MealCard`.
   - Se o usuário tiver permissão de edição (`canEdit === true`):
     - O bloco de horário (`🕒 06:00 - 10:00`) se torna um elemento interativo acessível (botão estilizado com feedback ao passar o cursor, ícone de relógio e cursor pointer).
     - Ao clicar, aciona o modal de ajuste de horários (`EditMealSchedulesModal`), permitindo ao Admin Geral / Admin alterar o horário daquela refeição.
   - Para usuários sem permissão ou quando o cardápio estiver trancado, o horário permanece como texto informativo estático.

3. **Trava Universal de Scroll de Fundo (`useBodyScrollLock`):**
   - Criar o hook unificado `frontend/src/shared/hooks/useBodyScrollLock.ts`.
   - Controlar a contagem de modais ativos (`lockCount`), desativar `document.body.style.overflow = 'hidden'` e prevenir deslocamento de layout com compensação de scrollbar.
   - Aplicar o hook em `EditMealModal`, `EditMealSchedulesModal`, `Modals.tsx` (Drawers e Modais gerais) e modais adjacentes.
   - Adicionar `overscroll-contain` nos contêineres de scroll dos modais.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Interface mais limpa e consistente sem elementos duplicados.
  - Edição imediata de horários com 1 clique diretamente no card.
  - Fim do vazamento de rolagem do fundo da página ao abrir qualquer modal ou popup.
- **Desvantagens / Riscos:**
  - Garantir que a restauração de `overflow` ocorra corretamente ao desmontar componentes ou fechar modais aninhados (resolvido via contador de locks).

---

## 4. Critérios de Aceitação
- [x] Card vazio exibe apenas uma única ação central de adição de prato (sem botão `+` redundante no header).
- [x] Card com prato exibe o botão `edit` no topo direito normalmente.
- [x] Clicar no horário da refeição (`06:00 - 10:00`) abre o modal de edição de horários quando o usuário for Admin Geral ou Admin (e o menu não estiver trancado).
- [x] Modais e drawers abertos travam completamente o scroll do body (o fundo permanece estático).
- [x] Fechar os modais restaura perfeitamente o scroll do body sem glitches visuais.

---

## 5. Plano de Implementação (Passo a Passo)
1. Criar `frontend/src/shared/hooks/useBodyScrollLock.ts`.
2. Atualizar `frontend/src/features/meals/components/MealCard.tsx` com remoção do `+` redundante e horário clicável.
3. Atualizar `frontend/src/features/meals/components/MealsView.tsx`, `EditMealModal.tsx` e `EditMealSchedulesModal.tsx`.
4. Integrar `useBodyScrollLock` em `Modals.tsx` e modais globais.
5. Validação via `rtk npm run typecheck` e `rtk npm run build`.

---

## 6. Validação e Testes
- [x] Typecheck sem erros (`rtk npm run typecheck`)
- [x] Build do frontend executado com sucesso (`rtk npm run build`)
- [x] Testes unitários do backend sem regressões (`rtk npm test`)
- [x] Teste de scroll lock em desktop e touch
- [x] Teste de interação no MealCard

---

## 7. Sincronização com /docs
- [x] `docs/product/meals-menu.md` atualizado com as novas regras e ergonomia de cards.
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
