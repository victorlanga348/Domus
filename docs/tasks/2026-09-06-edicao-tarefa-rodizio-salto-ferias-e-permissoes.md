# Task: Edição de Tarefas de Rodízio, Preservação da Escala, Salto de Férias e Governança de Acesso
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/components/tasks-views.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Atualmente, as tarefas residenciais do Domus possuem suporte a rodízio e participantes múltiplos no modelo de dados, porém:
1. **Falta de Edição de Rodízio:** Não existe rota de atualização (`PUT/PATCH /api/tasks/:id`) no backend nem interface modal de edição no frontend para adicionar ou remover moradores do rodízio de uma tarefa existente.
2. **Risco de Quebra de Escala:** Ao adicionar ou remover participantes em uma tarefa com rotação em andamento, uma alteração ingênua do índice de rotação (`rotation_index`) faria com que o morador cuja vez é a atual perdesse seu turno ou pulasse pessoas injustamente.
3. **Membros em Modo Férias (`vacation_mode`):** Moradores que entram em modo férias devem ser automaticamente retirados da escala ativa no rodízio (pulados para o próximo membro ativo) sem necessidade de removê-los manualmente do cadastro da tarefa, e reingressar na escala normalmente ao retornar.
4. **Governança Estrita de Acesso:** Apenas o **Admin Geral** e os **Sub-Admins** (`role === 'ADMIN' | 'SUB_ADMIN'` / `'Admin Geral' | 'Admin'`) possuem autorização para alterar participantes da escala de rodízio. Moradores comuns (`Resident`, `MEMBER`) não podem alterar tarefas ou composições de rodízio (bloqueio 403 no backend e ocultação/bloqueio de controle no frontend).

---

## 2. Solução Proposta

### 2.1 Endpoint de Atualização e Algoritmo de Preservação de Escala (`backend`)
- Criar rota `PUT /api/tasks/:id` e `PATCH /api/tasks/:id` em `tasks.routes.ts`, `tasks.controller.ts` e `tasks.service.ts`.
- **Validação de Permissão (403 Forbidden):**
  - Checar se o requisitante possui papel de `ADMIN` (Admin Geral) ou `SUB_ADMIN` (Admin). Rejeitar com `403 FORBIDDEN_TASK_UPDATE` caso contrário.
- **Algoritmo de Preservação de Escala (`Rotation-Preserving Engine`):**
  1. Identificar o morador que atualmente detém a vez na tarefa (`currentAssigneeId`) antes da alteração.
  2. Atualizar a lista de participantes em `TaskParticipant` (adicionando novos e removendo excluídos).
  3. Ordenar a nova lista de participantes em ordem alfabética canônica (A-Z).
  4. Se `currentAssigneeId` ainda fizer parte da lista:
     - Localizar sua nova posição no array ordenado e atribuir esse novo índice ao `rotation_index` da tarefa.
     - Desta forma, a pessoa da vez **mantém exatamente a sua vez**, os novos membros entram na fila nas posições adequadas e ninguém tem a vez tomada.
  5. Se `currentAssigneeId` foi removido da tarefa:
     - Identificar quem era o sucessor imediato na lista anterior que ainda permanece na nova lista e apontar o `rotation_index` para ele.
  6. Registrar auditoria em `ActivityLog` (`ROTATED`) com comentário: `"[Nome] atualizou a escala de rodízio da tarefa [Título]"`.
  7. Emitir broadcast via WebSocket (`task:updated`) para todos os clientes conectados da casa.

### 2.2 Salto Automático de Férias (`vacation_mode`)
- O `RotationService` já contém o salto circular de candidatos com `vacation_mode: true`.
- Garantir que tanto na API (`tasksApi.getTasks`, `dashboardApi`), quanto na sincronização frontend (`mapBackendTaskToHouseTask` e `rotations.queue`), membros de férias nunca sejam apontados como `isNext = true`.
- Na visualização dos rodízios (`TasksRotationsView.tsx`), exibir badge visual claro indicando moradores ausentes (`🏖️ Férias - fora da escala ativa`) e transferir a estrela de próximo para o morador ativo correspondente.

### 2.3 Modal e Ações de Edição no Frontend (`TasksRotationsView.tsx`)
- Adicionar botão **"Editar Rodízio"** nos cartões de tarefas e rodízios:
  - Visível e ativo exclusivamente para quem tem cargo `Admin Geral` ou `Admin`.
- Criar modal de edição de rodízio (`EditRotationModal`):
  - Permite alterar título, turno, frequência e selecionar via checkboxes os moradores participantes.
  - Sinaliza visualmente os membros que estão atualmente em modo férias.
  - Preview dinâmico da ordem da fila e do morador que ficará com a vez antes de salvar.
- Conectar a chamada ao `tasksApi.updateTask(taskId, payload)`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Flexibilidade total para gerenciar moradores e escalas da casa sem resetar ou bagunçar a ordem de quem já lavou a louça ou limpou a casa.
  - Automação completa de férias: o morador viaja, ativa o Modo Férias e não precisa ser excluído e readicionado manualmente à tarefa.
  - Segurança e conformidade rigorosa com a hierarquia de liderança da residência.
- **Desvantagens / Riscos:**
  - Se todos os membros da escala estiverem de férias simultaneamente, o sistema deve tratar com elegância sem quebrar a tela (exibindo aviso de que todos os participantes estão em férias).

---

## 4. Critérios de Aceitação
- [x] Rota `PUT /api/tasks/:id` implementada no backend com validação de payload e suporte a `participant_ids`.
- [x] Bloqueio estrito (403 Forbidden) para moradores que não sejam Admin Geral ou Sub-Admin.
- [x] Algoritmo calcula novo `rotation_index` preservando a vez do morador atual.
- [x] Morador com `vacation_mode = true` é pulado da escala ativa e ganha badge de férias no visual.
- [x] Frontend exibe botão de edição apenas para administradores.
- [x] Modal de edição permite adicionar/remover participantes e salva com sucesso via API.
- [x] WebSocket sincroniza a tarefa atualizada em tempo real para os demais aparelhos.
- [x] Testes automatizados e builds passando com 0 erros via `rtk`.
- [x] Documentação `/docs` sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend Repository & Service:**
   - Adicionar método `update` em `tasks.repository.ts`.
   - Adicionar lógica de autorização e algoritmo de preservação de escala em `tasks.service.ts`.
2. **Backend Controller & Routes:**
   - Adicionar `updateTask` em `tasks.controller.ts` e registrar rotas `PUT /:id` e `PATCH /:id` em `tasks.routes.ts`.
3. **Frontend API & Types:**
   - Adicionar `updateTask` em `frontend/src/features/tasks-rotation/api/tasksApi.ts`.
   - Adicionar `participantIds` e propriedades de férias nos tipos necessários.
4. **Frontend UI & Modal:**
   - Criar `EditRotationModal` e integrá-lo a `TasksRotationsView.tsx`.
   - Conectar handler `handleUpdateTask` em `App.tsx` com atualização de estado e emissão de socket.
5. **Validação Técnica:**
   - Executar typecheck e build no backend e frontend (`rtk npm run typecheck`, `rtk npm run build`).
6. **Sincronização de Docs:**
   - Atualizar `docs/product/tasks-rotation.md` e `docs/integrations/api-contracts.md`.

---

## 6. Validação e Testes
- [x] Typecheck do backend (`rtk npm run typecheck` em `backend/`)
- [x] Typecheck do frontend (`rtk npm run typecheck` em `frontend/`)
- [x] Build do frontend (`rtk npm run build`)
- [x] Teste unitário da preservação do índice de rotação e permissões (`task.update.test.ts`)
- [x] Testes E2E de ciclo de vida (`lifecycle.e2e.test.ts`)

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/tasks/2026-09-06-edicao-tarefa-rodizio-salto-ferias-e-permissoes.md`
