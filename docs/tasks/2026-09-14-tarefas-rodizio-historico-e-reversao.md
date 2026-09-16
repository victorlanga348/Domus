# Task: Preservação de Tarefas de Rodízio no Histórico e Fluxo de Reversão

**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/product/reports-and-metrics.md]]`

---

## 1. Contexto & Problema
Ao concluir uma tarefa de rodízio pela interface de tarefas (`TasksRotationsView.tsx`), o botão "Concluir" acionava simultaneamente `onTaskStatusChange(task.id, 'completed')` e `onRotateNext(...)`. 

A chamada adicional a `onRotateNext` disparava o endpoint `/api/tasks/:id/rotate` que redefine o status da tarefa no banco de dados para `OPEN`, sobrescrevendo o status `COMPLETED`. Por conta disso:
1. A tarefa de rodízio não permanecia no estado `COMPLETED` no backend e não aparecia na aba de **Histórico de Tarefas** (`ReportsView`);
2. Os filtros por membro e busca em `ReportsView` checavam apenas `item.nextMember` (que aponta para o sucessor da fila) e não `item.completedBy` (o morador que efetivamente concluiu a tarefa);
3. A tarefa concluída não podia ser visualizada no histórico nem revertida adequadamente pelos Administradores.

---

## 2. Solução Proposta

1. **Remoção do Duplo Disparo no Botão Concluir (`TasksRotationsView.tsx`):**
   - No clique de "Concluir", disparar exclusivamente `onTaskStatusChange(task.id, 'completed')`.
   - `App.tsx` e o backend `TaskService.completeTask` já cuidam do avanço circular do rodízio, da atribuição do próximo morador e da persistência da tarefa como `COMPLETED` com o autor da conclusão em `locked_by_id`.

2. **Ajuste dos Filtros e Busca no Histórico (`ReportsView.tsx`):**
   - Atualizar a filtragem por membro (`memberFilter`) para validar se `memberFilter === 'all' || item.completedBy === memberFilter || item.nextMember === memberFilter`.
   - Atualizar a busca textual (`searchQuery`) para casar com `item.title`, `item.completedBy` e `item.nextMember`.
   - Exibir o autor da conclusão (`Concluída por: [Nome]`) com o avatar correto do morador que concluiu a tarefa.

3. **Exibição de Status Concluído nos Cards de Tarefas (`TasksRotationsView.tsx`):**
   - Quando `task.status === 'completed'`, exibir na barra de responsabilidade o rótulo `"Concluída por:"` com o nome e avatar do morador que concluiu (`task.completedBy`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Histórico Completo e Auditável:** Toda e qualquer tarefa de rodízio concluída pela pessoa designada é registrada e visível no histórico da residência.
  - **Reversibilidade Garantida:** Administradores podem localizar a tarefa de rodízio concluída no histórico (`ReportsView`) ou na listagem de tarefas e revertê-la com segurança, devolvendo a tarefa ao responsável anterior.
- **Desvantagens / Riscos:**
  - Nenhuma desvantagem técnica identificada; alinha o frontend à máquina de estados canônica do backend.

---

## 4. Critérios de Aceitação
- [x] Concluir uma tarefa de rodízio marca seu status como `COMPLETED` e a mantém no histórico de relatórios (`ReportsView`).
- [x] A tarefa concluída exibe claramente no histórico quem a concluiu (`Concluída por: [Nome]`) com avatar correspondente.
- [x] Filtrar pelo nome do morador no histórico retorna todas as tarefas de rodízio concluídas por ele.
- [x] Administradores e Admin Geral visualizam o botão "Reverter p/ Pendente" na tarefa concluída em `ReportsView` e em `TasksRotationsView`.
- [x] A reversão a partir do histórico restaura a tarefa para `OPEN` e devolve a responsabilidade para quem a havia concluído, refletindo universalmente para todos os moradores.
- [x] Suíte de testes unitários e de integração passando com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)
1. Em `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`:
   - Remover a chamada redundante `onRotateNext` no botão de concluir.
   - Ajustar o card de tarefa para exibir `"Concluída por:"` e o avatar de `task.completedBy` quando `task.status === 'completed'`.
2. Em `frontend/src/features/reports/components/ReportsView.tsx`:
   - Corrigir `memberFilter` e `searchQuery` para considerar `item.completedBy`.
3. Validar fluxo com typecheck e testes automatizados.
4. Sincronizar especificações em `/docs`.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no frontend e backend.
- [x] `rtk npm test` no backend.
- [x] Build do frontend executado com sucesso (`rtk npm run build`).

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` e `docs/product/reports-and-metrics.md` atualizados.
- [x] Matriz de governança verificada em `docs/documentation-governance.md`.
