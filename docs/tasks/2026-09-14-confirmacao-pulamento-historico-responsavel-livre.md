# Task: Confirmação de Pulamento de Tarefa, Histórico de Puladas e Indicação de Responsável Conclusor / Livre

**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/pages/tasks-rotation.md]]`, `[[docs/pages/reports.md]]`

---

## 1. Contexto & Problema
Atualmente, a ação de pular uma tarefa no rodízio ocorre de forma imediata ao clique sem nenhuma etapa de confirmação, aumentando o risco de toques acidentais e avanço indesejado da fila. Além disso:
1. No histórico de tarefas (`ReportsView`), quando uma tarefa é pulada, o registro não detalha de forma explícita que a tarefa foi pulada nem quem realizou o pulamento (mostrando o rótulo genérico "Responsável:" com o sucessor da fila em vez de "Pulada por: [Nome]").
2. A barra/área de responsável no cartão de tarefa exibe o próximo morador da fila mesmo quando a tarefa já se encontra concluída, em vez de evidenciar a pessoa que a concluiu (`task.completedBy`).
3. Quando uma tarefa não possui um responsável específico definido (tarefa comunitária / sem participantes atribuídos), alguns pontos da interface exibem rótulos inconsistentes (como "Sem atribuição", "Todos" ou "Qualquer pessoa") em vez da designação padronizada **"Livre"**.

---

## 2. Solução Proposta

1. **Confirmação Obrigatória ao Pular Tarefa (`ConfirmActionModal`):**
   - Ao clicar no botão `[ Pular ]` em qualquer tarefa de rodízio, abrir modal de confirmação antes de qualquer transição de estado.
   - O modal deve exibir título explicativo, mensagem clara de aviso informando que a vez passará para a próxima pessoa da fila e será registrada no histórico, com botões de confirmação (`[ Pular Tarefa ]`) e cancelamento (`[ Cancelar ]`).

2. **Registro de Auditoria e Histórico de Tarefas Puladas (`ReportsView` & `ActivityLog`):**
   - Na conclusão/pulamento da tarefa, registrar `skippedBy`, `skippedById` e `skippedAt` no modelo de dados da tarefa (`HouseTask`).
   - Emitir e persistir o log de atividade: `"[Nome] pulou a tarefa \"[Título]\"."` via `recordHouseActivity` com tipo `ROTATED`.
   - No `ReportsView` (Histórico de Tarefas):
     - Para tarefas com `status === 'skipped'`: exibir badge `"Pulada"` em tom âmbar e o rótulo explícito `"Pulada por:"` acompanhado do avatar e nome de quem a pulou.
     - Atualizar a busca e o filtro por membro para reconhecer também `skippedBy` e `completedBy`, garantindo que moradores encontrem suas tarefas puladas e concluídas com precisão.

3. **Área do Responsável: Conclusor da Tarefa e Padronização de Tarefas Livres ("Livre"):**
   - Na barra de responsável de cada cartão de tarefa (`TasksRotationsView`), no Drawer de Notificações (`Modals.tsx`) e nas visões pertinentes:
     - **Se a tarefa estiver concluída (`COMPLETED` / `completed`):** Exibir a pessoa responsável por concluir a tarefa (`task.completedBy`), acompanhada de seu avatar real.
     - **Se a tarefa estiver aberta/pendente:** Exibir o morador responsável atual designado (`task.nextMember`).
     - **Se não houver responsável definido (livre / comunitária / sem morador atribuído):** Exibir obrigatoriamente **"Livre"** (sem avatar).

4. **Backend e API (`TaskService` e `TaskController`):**
   - Disponibilizar suporte específico no endpoint `/api/tasks/:id/skip` (ou extensão de `/rotate`), validando se quem está pulando é o morador da vez ativa ou o Admin Geral.
   - Registrar `ActivityLog` com o comentário `Tarefa "[Título]" foi pulada por [Nome]`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Segurança Operacional:** O modal de confirmação impede pulamentos acidentais por toques no celular.
  - **Transparência e Responsabilidade:** O histórico passa a refletir exatamente quem executou cada ação (conclusão ou pulamento), eliminando ambiguidades entre os moradores da residência.
  - **Consistência Visual e Cognitiva:** A designação "Livre" unifica a linguagem do aplicativo quando qualquer pessoa pode assumir a tarefa.
- **Desvantagens / Riscos:**
  - Adição de um clique a mais para pular a tarefa (mitigado pelo ganho crítico de prevenção contra toques falsos no mobile).

---

## 4. Critérios de Aceitação
- [x] O clique em "Pular" abre o modal de confirmação com visual Domus (`ConfirmActionModal`).
- [x] A tarefa só é pulada e o rodízio só avança após confirmação explícita no modal.
- [x] Ao pular, é registrado no histórico (`ReportsView`) o status `"Pulada"` e o texto `"Pulada por: [Nome de quem pulou]"`, com o avatar correspondente.
- [x] O feed central de atividades (`ActivityLog` / Notificações) recebe o evento de que a tarefa foi pulada pelo morador.
- [x] Na área do responsável (cartão de tarefa), se a tarefa estiver concluída, exibe quem a concluiu (`completedBy`).
- [x] Na área do responsável, se não houver um responsável designado (tarefa aberta/sem participantes), exibe `"Livre"`.
- [x] Filtro e busca de membros no histórico consideram quem pulou e quem concluiu a tarefa.
- [x] Typecheck e suíte de testes passando com 100% de sucesso sem regressões.

---

## 5. Plano de Implementação (Passo a Passo)

1. **Tipos (`frontend/src/types.ts`):**
   - Adicionar `skippedBy?: string; skippedById?: string; skippedAt?: string;` em `HouseTask`.
2. **Backend (`backend/src/modules/tasks/`):**
   - Adicionar método `skipTask` no `TaskService` e rota `POST /api/tasks/:id/skip` no `TasksController` / `tasks.routes.ts` registrando auditoria no `ActivityLog`.
   - Adicionar testes unitários para a governança de pulamento.
3. **Frontend API (`frontend/src/features/tasks-rotation/api/tasksApi.ts`):**
   - Adicionar método `skipTask(taskId, userId, userRole)` chamando o backend.
4. **Componente de Tarefas (`frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`):**
   - Implementar estado `taskToSkip: HouseTask | null` e renderizar `ConfirmActionModal`.
   - Atualizar a barra do responsável (`Responsável:`) para exibir `task.completedBy` quando concluída, o responsável atual quando aberta, ou `"Livre"` se não houver responsável.
5. **Histórico de Relatórios (`frontend/src/features/reports/components/ReportsView.tsx`):**
   - Exibir `"Pulada por: [Nome]"` para status `skipped` e `"Concluída por: [Nome]"` para status `completed`.
   - Exibir `"Livre"` caso não haja responsável nem autor.
   - Ajustar filtros de membro e busca textual para cobrir `skippedBy` e `completedBy`.
6. **Estado Global e Sockets (`frontend/src/App.tsx`):**
   - No `handleTaskStatusChange`, ao receber `newStatus === 'skipped'`, gravar `skippedBy`, `skippedById`, `skippedAt` e acionar `recordHouseActivity`.
   - No Drawer de Notificações (`Modals.tsx`), garantir que o responsável exiba o conclusor ou `"Livre"`.
7. **Validação Técnica:**
   - Executar `rtk npm run typecheck` (frontend e backend).
   - Executar `rtk npm test` no backend.
8. **Sincronização com `/docs`:**
   - Atualizar `docs/product/tasks-rotation.md`, `docs/integrations/api-contracts.md`, `docs/pages/tasks-rotation.md` e `docs/pages/reports.md`.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no frontend e no backend.
- [x] `rtk npm test` no backend (todos os testes verdes).
- [x] Teste de acessibilidade (ARIA labels e foco do modal de confirmação).

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` atualizado com as regras de pulamento, confirmação e responsável/livre.
- [x] `docs/integrations/api-contracts.md` atualizado com o endpoint de pulamento.
- [x] `docs/pages/tasks-rotation.md` e `docs/pages/reports.md` atualizados.
- [x] Governança validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md).
