# Task: Reversão de Tarefas de Rodízio com Retomada pelo Responsável Anterior

**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
Atualmente, quando uma tarefa de rodízio é concluída, o motor de rotação avança o `rotation_index` para o próximo participante ativo da fila circular. 

Contudo, ao reverter uma tarefa concluída para o estado pendente (`OPEN`), o `rotation_index` permanecia apontando para o próximo participante, mantendo a tarefa atribuída ao sucessor em vez de retornar para o morador que a havia concluído.

A regra de negócio canônica exige que, ao reverter uma tarefa (especialmente as de rodízio):
- A pessoa que havia realizado/concluído a tarefa deve **retomá-la imediatamente para si mesma**, como se **nunca a tivesse concluído**;
- Essa retomada e restauração da escala de rodízio deve **refletir em tempo real para todos os moradores da residência, sem exceção**.

---

## 2. Solução Proposta

1. **Backend - Motor de Reversão (`TaskService.revertTask` e `TaskRepository.revertStatus`):**
   - Ao executar a reversão de uma tarefa `COMPLETED` para `OPEN`:
     - Identificar o responsável que realizou a conclusão (`task.locked_by_id`).
     - Se a tarefa possuir múltiplos participantes (`participants.length > 1` - rodízio):
       - Obter a lista ordenada de participantes (ordem alfabética A-Z canônica).
       - Localizar a posição do morador que concluiu a tarefa (`task.locked_by_id`). Se encontrado, redefinir `rotation_index` para o índice exato desse morador.
       - Caso a conclusão tenha sido feita pelo Admin Geral em nome de terceiro ou o `locked_by_id` não esteja no pool, calcular o índice anterior na fila circular: `((task.rotation_index - 1) % poolSize + poolSize) % poolSize`.
     - Atualizar atomicamente a tarefa no banco com `status: 'OPEN'`, o novo `rotation_index`, `locked_by_id: null`, `locked_at: null` e `last_block_reason: null`.
     - Retornar o objeto `TaskWithDetails` completo com `participants.include.user`, `locked_by` e `creator`.

2. **Backend - Notificações em Tempo Real (WebSockets):**
   - No `TasksController.revertTask`, emitir para a sala da residência (`house:${houseId}`):
     - `house:task_status_changed`: `{ taskId, status: 'OPEN' }`
     - `task:updated`: `{ task: updatedTaskWithDetails }`
     - `house:rotation_advanced`: `{ rotationId: taskId, taskId, nextAssignee }`

3. **Frontend - Atualização Otimista e Sincronização Universal (`App.tsx`):**
   - Em `handleTaskStatusChange`:
     - Ao reverter (`newStatus === 'pending' && wasCompleted`), calcular otimisticamente o retorno da tarefa e da fila de rodízio (`rotations`) para o morador anterior (`completedById` / `completedByName`).
     - Ao receber a confirmação do backend (`tasksApi.revertTask`), mapear o payload oficial atualizando o estado de `tasks` e `rotations`.
     - Assegurar que os listeners de WebSocket (`onTaskUpdated`, `onTaskStatusChanged`, `onRotationAdvanced`) sincronizem instantaneamente todos os moradores conectados.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Consistência e Justiça na Convivência:** Garante que reversões desfaçam perfeitamente o ciclo de tarefas, evitando que o próximo morador seja injustamente onerado por uma tarefa não realizada ou revertida.
  - **Sincronia Total (Single Source of Truth):** O backend recomputa e persiste o índice no PostgreSQL e propaga o objeto populado via WebSocket, refletindo instantaneamente para todos os dispositivos.
- **Desvantagens / Riscos:**
  - Necessidade de garantir que se o morador que concluiu entrou em modo férias no intervalo entre a conclusão e a reversão, o algoritmo de `getNextParticipant` continue pulando-o suavemente se estiver indisponível.

---

## 4. Critérios de Aceitação
- [x] Ao reverter uma tarefa de rodízio concluída, o responsável atual (`nextMember` / `assignee`) volta a ser quem a concluiu.
- [x] O `rotation_index` no banco de dados é decrementado/restaurado para a posição exata do morador que concluiu.
- [x] A tarefa retorna para o status `OPEN` (pendente) com locks liberados.
- [x] O cartão de rodízio correspondente atualiza o badge `isNext` e o morador da vez para quem havia concluído.
- [x] A alteração reflete em tempo real para todos os clientes conectados via WebSocket.
- [x] Testes unitários no backend cobrem o fluxo de reversão de rodízio e preservação de participantes.
- [x] Typecheck e suíte de testes passando com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar `backend/src/modules/tasks/tasks.repository.ts` para permitir atualizar `rotation_index` no `revertStatus` e retornar `TaskWithDetails` completo com includes.
2. Atualizar `backend/src/modules/tasks/tasks.service.ts` no método `revertTask` para calcular e restaurar o `rotation_index` do autor da conclusão.
3. Atualizar `backend/src/modules/tasks/tasks.controller.ts` para emitir eventos completos de WebSocket no revert.
4. Adicionar testes unitários em `backend/tests/unit/tasks.revert.test.ts` validando a reversão de rodízio.
5. Atualizar `frontend/src/App.tsx` na função `handleTaskStatusChange` para atualização otimista precisa da escala de rodízio ao reverter.
6. Executar typecheck e rodar suíte de testes (`rtk npm test`).
7. Sincronizar especificações em `docs/product/tasks-rotation.md` e `docs/integrations/api-contracts.md`.

---

## 6. Validação e Testes
- [x] `rtk npm test` no backend (todos os testes passando).
- [x] `rtk npm run typecheck` no backend e frontend.
- [x] Validação visual e de consistência do estado de tarefas e rodízio.

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` atualizado com a regra formal de reversão de rodízio.
- [x] `docs/integrations/api-contracts.md` atualizado com o contrato do endpoint de reversão.
- [x] Matriz de governança verificada em `docs/documentation-governance.md`.
