# Task: Giro Automático de Rodízio na Conclusão e Registro do Autor no Histórico

**Data:** 2026-09-08  
**Status:** Proposta  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema

1. **Giro Manual Desnecessário de Rodízio:**
   - Atualmente, quando o morador da vez (ou o Admin Geral) conclui uma tarefa que faz parte de uma escala de rodízio, a tarefa muda para `COMPLETED`, mas a fila do rodízio no frontend não avança automaticamente.
   - O usuário é obrigado a navegar até a aba "Rodízios" e acionar o giro manual (`handleRotateNext`) para passar a vez para o próximo participante da escala.
   - O comportamento esperado pelo usuário é que, ao concluir a tarefa, **o rodízio gire sozinho imediatamente**, sem necessidade de intervenção manual subsequente.

2. **Falta de Identificação Clara do Autor da Conclusão no Histórico:**
   - No backend, ao concluir uma tarefa em `completeTask`, o comentário padrão gravado na tabela `ActivityLog` é apenas `"Tarefa concluída com sucesso"` (quando realizada pelo morador da vez), não explicitando o nome do morador no texto do comentário.
   - No histórico de atividades (Notificações, Relatórios e Dashboard), deve ficar inequívoco e transparente **quem foi o usuário que clicou para concluir a tarefa** (ex: `João concluiu a tarefa "Lavar Louça"`), com nome, avatar e carimbo de data/hora.

---

## 2. Solução Proposta

1. **Avanço Automático da Escala no Momento da Conclusão:**
   - **No Backend (`tasks.service.ts` & `tasks.controller.ts`):**
     - O método `completeTask` já calcula e salva o novo `nextRotationIndex`.
     - Garantir que o retorno de `completeTask` inclua o objeto atualizado da tarefa e o próximo responsável (`nextAssignee`).
     - No controller `completeTask`, emitir via WebSocket para a residência o evento `house:rotation_advanced` contendo `{ rotationId: task.id, taskId: task.id, nextAssignee }`, além do evento de conclusão `house:task_status_changed`.
   - **No Frontend (`App.tsx` & `handleTaskStatusChange`):**
     - Ao concluir uma tarefa (`newStatus === 'completed'`), se a tarefa tiver mais de 1 participante ou possuir rodízio associado, disparar automaticamente o avanço da fila do rodízio (`queue.shift()`, `queue.push(first)`, definindo o novo `isNext`).
     - Atualizar imediatamente o estado local de `rotations` e o `nextMember` / `nextMemberId` da tarefa em `tasks`.
     - Emitir `emitRotationAdvanced` e manter a coerência caso outro dispositivo esteja conectado.

2. **Registro Explícito do Autor no Histórico (`ActivityLog`):**
   - **No Backend (`tasks.service.ts`):**
     - Formatar o comentário do log para indicar claramente o autor da ação:
       - Se Admin Geral concluindo tarefa de terceiro: `"${user.name} (Admin Geral) concluiu a tarefa \"${task.title}\""`
       - Se responsável direto/da vez: `"${user.name} concluiu a tarefa \"${task.title}\""`
     - Incluir a relação `user` no payload do log emitido via WebSocket e retornado nas consultas.
   - **No Frontend (`App.tsx` & `recordHouseActivity`):**
     - Ajustar `handleTaskStatusChange` para registrar no histórico local e central:
       `"${completedByName} concluiu a tarefa \"${taskObj.title}\""` com `author: completedByName`, `user_id: completedById` e `action_type: 'COMPLETED'`.
     - No mapeamento `mapBackendLogToActivityLog`, garantir que o autor e a mensagem exibam o nome de quem realizou a conclusão.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - **Fricção Zero:** O usuário conclui a tarefa e o ciclo de convivência avança sozinho para o próximo morador sem passos manuais redundantes.
  - **Transparência e Prestação de Contas:** Todos na casa conseguem verificar no mural/histórico exatamente quem deu baixa na tarefa.
  - **Sincronização em Tempo Real:** Todos os aparelhos conectados recebem o giro e a notificação instantaneamente via WebSocket.
- **Desvantagens / Riscos:**
  - Se a tarefa for concluída por engano, a reversão (`revertTask`) deve permitir reabrir a tarefa e, caso necessário, restaurar a escala anterior.
- **Mitigações:**
  - Preservar o botão de giro manual caso o morador da vez precise trocar de turno ou passar a vez sem ter executado a tarefa.

---

## 4. Critérios de Aceitação

- [ ] Ao clicar em "Concluir Tarefa" (seja na lista de tarefas, dashboard ou notificações), se a tarefa for de rodízio, a fila avança automaticamente para o próximo morador (A-Z com salto de férias).
- [ ] O card do rodízio na aba "Rodízios" reflete imediatamente o novo morador da vez (`isNext: true`), sem necessidade de clicar no botão "Girar / Avançar".
- [ ] O histórico de atividades registra e exibe com destaque o nome exato do usuário que concluiu a tarefa (ex: `João concluiu a tarefa "Lavar Louça"`).
- [ ] Todos os moradores da residência visualizam em tempo real no feed de atividades quem concluiu e quem é o novo responsável pelo rodízio.
- [ ] Testes unitários do backend cobrem o giro automático e o formato do comentário do log de atividade.
- [ ] Typecheck e build passam com 100% de sucesso.

---

## 5. Plano de Implementação (Passo a Passo)

1. **Backend - `tasks.service.ts`:**
   - No método `completeTask`, padronizar o `logComment` para incluir explicitamente o nome do usuário e o título da tarefa (`${user.name} concluiu a tarefa "${task.title}"`).
   - Garantir que a tarefa retornada traga os dados completos de rotação.
2. **Backend - `tasks.controller.ts`:**
   - No método `completeTask`, emitir via WebSocket `house:rotation_advanced` caso a tarefa concluída possua mais de 1 participante (`participants.length > 1`), notificando todos os moradores em tempo real.
3. **Frontend - `App.tsx`:**
   - No `handleTaskStatusChange`:
     - Ao concluir tarefa com rodízio (`taskObj?.participants.length > 1` ou correspondente em `rotations`), invocar automaticamente a rotação da escala em `setRotations` e `setTasks` (avançando a fila circular e definindo o novo `isNext`).
     - Emitir `emitRotationAdvanced` via WebSocket.
     - Garantir que `recordHouseActivity` envie o comentário claro: `"${completedByName} concluiu a tarefa \"${taskObj.title}\""`.
4. **Backend - Testes Unitários:**
   - Adicionar/ajustar testes em `backend/src/modules/tasks/__tests__/` validando que `completeTask` gera log com o nome do executor e retorna o `nextAssignee`.
5. **Validação Técnica:**
   - Executar `rtk npm test` no backend.
   - Executar `rtk npm run typecheck` no frontend e backend.
   - Executar `rtk npm run build`.
6. **Sincronização de Docs:**
   - Atualizar `docs/product/tasks-rotation.md` documentando o giro automático na conclusão e o registro do executor no histórico.
