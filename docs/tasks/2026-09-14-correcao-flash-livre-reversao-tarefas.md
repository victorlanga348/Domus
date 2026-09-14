# Task: Correção do Flash "Livre" na Reversão de Tarefas
**Data:** 2026-09-14  
**Status:** Proposta  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/pages/tasks-rotation.md]]`

---

## 1. Contexto & Problema
Ao reverter uma tarefa concluída ou pulada (através do botão "Reverter p/ Pendente" com confirmação), o cartão da tarefa apresenta temporariamente o responsável como `"Livre"` durante a atualização otimista (optimistic UI), e apenas centenas de milissegundos depois (quando a resposta da API chega ou o evento de socket sincroniza) o responsável muda para a pessoa que havia feito a tarefa por último.

### Causas-Raiz Identificadas:
1. **Perda de Relações no Backend (`completeTask` e `advanceRotation`):**
   - No `completeTask` e `advanceRotation`, o comando `prisma.task.update` não incluía `participants`, `locked_by` nem `creator`.
   - Ao emitir `task:updated`, o payload da tarefa continha apenas os campos escalares. No frontend, `mapBackendTaskToHouseTask` recebia esse payload sem `participants`, forçando `isRotation = false`, `participantIds = []`, `nextMember = 'Livre'` e `completedBy = 'Concluído'`.
2. **Cálculo Otimista da Reversão no Frontend:**
   - Em `handleTaskStatusChange`, ao reverter (`newStatus === 'pending'`), se `t.completedBy` estiver como `'Concluído'` ou indefinido, `whoCompletedName` caía no usuário logado (`authUser`) ou `t.completedBy` sem ID correspondente no `familyMembers`.
   - Em tarefas de rodízio, a fila em `rotations` contém os participantes em ordem circular, onde o último executor é exatamente o participante que antecede a vez atual (`isNext`). Essa informação não era consultada caso `completedById` não estivesse presente.
3. **Condição de "Livre" Falso-Positivo na UI:**
   - Em `TasksRotationsView.tsx` e `ReportsView.tsx`, a condição `isFree` avaliava `(!task.nextMemberId && !task.isRotation && (!task.participantIds || task.participantIds.length === 0))`. Se uma tarefa tivesse `task.nextMember` preenchido (ex: `"Victor"`), mas `nextMemberId` estivesse nulo e `isRotation` tivesse sido temporariamente zerado, o card exibia `"Livre"`.
4. **Normalização de Status em Sockets:**
   - O socket `house:task_status_changed` emitia `status: 'OPEN'` do backend, enquanto o frontend espera `HouseTask['status']` como `'pending'`.

---

## 2. Solução Proposta
1. **Preservação de Relações no Backend:**
   - Atualizar `completeTask` em `tasks.service.ts` e `advanceRotation` em `tasks.rotation.service.ts` para incluir `participants: { include: { user: true } }`, `locked_by: true` e `creator: true` no retorno do Prisma.
2. **Cálculo Otimista Imediato e Robusto da Reversão no Frontend:**
   - Ao disparar a reversão para `'pending'`, identificar com precisão o último executor da tarefa na seguinte ordem de prioridade:
     1. `t.completedById` / `t.completedBy` (se diferente de `'Concluído'` e `'Livre'`);
     2. Na escala de rodízio (`rotations.find(...)`): o membro imediatamente anterior ao `isNext` na fila circular;
     3. No histórico `activityLogs`: o autor do evento de conclusão mais recente desta tarefa;
     4. O próprio `t.nextMember` ou morador logado.
   - Atualizar o estado local imediatamente com:
     - `nextMember`: nome do último executor identificado;
     - `nextMemberId`: ID do morador encontrado no `familyMembers`;
     - `nextMemberAvatar`: avatar do morador;
     - Preservar `isRotation`, `participantIds` e `participants`.
   - Sincronizar simultaneamente a fila de `rotations`, marcando `isNext: true` exclusivamente para o membro restaurado.
3. **Refino da Verificação `isFree` na Barra de Responsável:**
   - Garantir que se `task.nextMember` possuir um nome válido de morador (diferente de `'Livre'`, `'Qualquer pessoa'`, `'Todos'`), nunca seja exibido `"Livre"`.
4. **Sanitização de Sockets e Mesclagem Segura em `onTaskUpdated`:**
   - Normalizar `OPEN` -> `pending` em `onTaskStatusChanged`.
   - Em `onTaskUpdated`, mesclar com os dados anteriores preservando participantes existentes caso o payload remoto omita arrays.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Eliminação instantânea do efeito "flash" de `"Livre"`. A UI reflete a pessoa correta em 0ms.
  - Consistência total entre estado otimista local, eventos de WebSocket e sincronização REST.
  - Conformidade estrita com o SDD e com a Seção 4.2 de `docs/product/tasks-rotation.md`.
- **Desvantagens / Riscos:**
  - Pequeno aumento no payload do Prisma em `completeTask` e `advanceRotation` ao incluir relações (impacto desprezível, compensado pela consistência de cache e sockets).

---

## 4. Critérios de Aceitação
- [ ] Ao clicar em "Reverter p/ Pendente" e confirmar no modal, a tarefa deve exibir imediatamente (0ms) o responsável anterior (último que concluiu ou rodízio restaurado), sem piscar `"Livre"`.
- [ ] O carrossel de rodízios e a fila de participantes em `rotations` devem atualizar no mesmo instante para apontar a vez ativa (`isNext: true`) para o morador restaurado.
- [ ] Ao recarregar a página ou receber eventos de socket (`task:updated`, `house:task_status_changed`), o responsável permanece idêntico e consistente.
- [ ] Tarefas genuinamente comunitárias (sem participantes ou marcadas como "Qualquer pessoa") continuam exibindo `"Livre"`.
- [ ] Nenhum erro de typecheck ou testes quebrados.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend (`tasks.service.ts` e `tasks.rotation.service.ts`):**
   - Incluir `participants`, `locked_by` e `creator` em `completeTask` e `advanceRotation`.
2. **Frontend (`App.tsx`):**
   - Melhorar a resolução do último executor em `handleTaskStatusChange` (com fallback no `rotations.queue` e `activityLogs`).
   - Normalizar `'OPEN'` para `'pending'` em `onTaskStatusChanged`.
   - Preservar participantes em `onTaskUpdated`.
3. **Frontend (`TasksRotationsView.tsx` e `ReportsView.tsx`):**
   - Refinar a lógica de `isFree` para nunca mascarar um `nextMember` nominal válido como `"Livre"`.
4. **Validação & Testes:**
   - Executar `rtk npm test` no backend.
   - Executar `rtk npm run typecheck` no frontend e backend.
   - Executar `rtk npm run build` no frontend.

---

## 6. Validação e Testes
- [ ] `rtk npm test` no backend executado com 100% de sucesso.
- [ ] `rtk npm run typecheck` no frontend e backend sem erros.
- [ ] `rtk npm run build` no frontend concluído com sucesso.

---

## 7. Sincronização com /docs
- [ ] `docs/product/tasks-rotation.md` atualizado detalhando a transição imediata (0ms) sem estado intermediário "Livre".
- [ ] `docs/tasks/2026-09-14-correcao-flash-livre-reversao-tarefas.md` atualizado para status "Concluída".
- [ ] Governança de documentação verificada.
