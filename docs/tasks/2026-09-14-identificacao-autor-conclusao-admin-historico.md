# Task: Identificação do Autor da Conclusão e Destaque de Admin no Histórico de Tarefas

**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/product/reports-and-metrics.md]]`

---

## 1. Contexto & Problema
No histórico de tarefas (`ReportsView`) e na listagem de tarefas concluídas (`TasksRotationsView`), quando uma tarefa (especialmente de rodízio) era concluída, o autor da conclusão não era identificado com precisão porque:
1. O backend `completeTask` atualizava a tarefa sem incluir os dados relacionais de `locked_by` no retorno do Prisma, fazendo com que o frontend recebesse o fallback genérico `'Concluído'`;
2. No frontend, quando `task.locked_by` vinha nulo, não havia fallback para buscar o membro por `task.locked_by_id` na lista de membros da casa;
3. Não havia distinção visual no histórico entre uma tarefa concluída pelo morador responsável/da vez e uma tarefa concluída por intervenção de um **Admin** ou **Admin Geral**.

---

## 2. Solução Proposta

1. **Backend - Inclusão de Relacionamentos na Conclusão (`TaskService.completeTask`):**
   - Incluir `locked_by: true`, `participants: { include: { user: true } }` e `creator: true` no `prisma.task.update` de `completeTask`.
   - Garantir que tanto o endpoint `POST /api/tasks/:id/complete` quanto a emissão do WebSocket `task:updated` enviem os dados completos do usuário que realizou a conclusão.

2. **Frontend - Mapeamento Robusto do Autor (`mapBackendTaskToHouseTask` em `App.tsx`):**
   - Mapear `completedBy` utilizando `task.locked_by?.name` ou localizando o morador por `task.locked_by_id` em `familyMembers`.
   - Mapear `completedById` e `completedByRole` para identificar o cargo de quem concluiu.

3. **Frontend - Distinção Visual e Destaque de Admin no Histórico (`ReportsView.tsx` e `TasksRotationsView.tsx`):**
   - Exibir com precisão o nome e avatar do morador que concluiu a tarefa (`Concluída por: [Avatar] [Nome]`).
   - Se o autor da conclusão for um **Admin Geral** ou **Admin / Sub-Admin**, exibir um badge perceptível ao lado do nome (ex: `Admin Geral` ou `Admin`), permitindo que todos os moradores da residência saibam de imediato se a tarefa foi realizada pelo responsável da escala ou por intervenção administrativa.
   - Se for o morador regular da vez, exibir seu nome e avatar de forma limpa e destacada.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Transparência Total na Convivência:** Deixa claro para todos os moradores se o responsável realizou a tarefa ou se um Administrador interveio para concluí-la.
  - **Auditabilidade e Governança:** Informações sempre completas no histórico da residência e nos relatórios.
- **Desvantagens / Riscos:**
  - Nenhuma desvantagem técnica.

---

## 4. Critérios de Aceitação
- [x] No histórico de tarefas (`ReportsView`), tarefas de rodízio concluídas exibem o nome real e avatar do morador que as concluiu (`Concluída por: [Nome]`).
- [x] Quando um Admin Geral concluir a tarefa, é exibido o badge destacado `Admin Geral` ao lado do seu nome.
- [x] Quando um Sub-Admin/Admin concluir a tarefa, é exibido o badge destacado `Admin` ao lado do seu nome.
- [x] Quando o morador da vez/responsável concluir, seu nome e avatar são exibidos de forma clara.
- [x] Nos cards de tarefas concluídas em `TasksRotationsView`, o autor e os badges de cargo são exibidos de forma idêntica.
- [x] O backend retorna o objeto `TaskWithDetails` com `locked_by` populado na conclusão de tarefas.
- [x] Typecheck e suíte de testes com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `backend/src/modules/tasks/tasks.service.ts` no método `completeTask` para incluir `locked_by: true`, `participants` e `creator` no `prisma.task.update`.
2. Atualizar `frontend/src/types.ts` para adicionar `completedByRole` ao tipo `HouseTask`.
3. Atualizar `frontend/src/App.tsx` no método `mapBackendTaskToHouseTask` e no `handleTaskStatusChange` para mapear `completedBy`, `completedById` e `completedByRole` com fallback via `familyMembers`.
4. Atualizar `frontend/src/features/reports/components/ReportsView.tsx` para renderizar o autor com o badge de `Admin Geral` / `Admin`.
5. Atualizar `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx` para renderizar o autor com o badge de cargo no card concluído.
6. Executar typecheck e rodar testes automatizados.
7. Sincronizar especificações em `/docs`.

---

## 6. Validação e Testes
- [x] `rtk npm test` no backend (76/76 testes aprovados).
- [x] `rtk npm run build` no backend (TypeScript compilation ok).
- [x] `rtk npm run build` no frontend (Vite build ok).

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` e `docs/product/reports-and-metrics.md` atualizados.
- [x] Matriz de governança verificada em `docs/documentation-governance.md`.
