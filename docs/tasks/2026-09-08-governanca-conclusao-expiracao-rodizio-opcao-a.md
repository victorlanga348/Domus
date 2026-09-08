# Task: Governança Universal de Conclusão, Expiração Diária de Tarefas e Rodízio com Penalidade (Opção A)
**Data:** 2026-09-08  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/components/modals.md]]`
- `[[docs/copywriting/microcopy.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
1. **Brecha de Conclusão no Drawer de Alertas (`NotificationsDrawer`):**
   - Na aba "Tarefas em Alerta" do drawer lateral de notificações ([`Modals.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Modals.tsx)), o botão **"Concluir"** é renderizado ativo para qualquer morador autenticado, mesmo que a tarefa pertença a outra pessoa.
   - Ao clicar, a interface tenta concluir, a requisição no backend falha por 403 (ou o estado fica descompassado) e o card não sai do lugar de forma consistente.
2. **Regra Universal de Conclusão não Uniforme:**
   - Em todo o aplicativo, **nenhum morador pode concluir tarefas que não sejam suas**, com a **exclusiva exceção do Admin Geral** (que possui poder de supervisão e intervenção em nome da casa). Atualmente, no backend até o Admin Geral é bloqueado, e no drawer de alertas qualquer um podia clicar.
3. **Ciclo de Vida de Tarefas Vencidas & Rodízio Inadimplente:**
   - Quando uma tarefa diária não é realizada até o término do ciclo (virada da noite / 00:00), o sistema não deve simplesmente apagá-la ou deixar a casa desorganizada.
   - É necessário aplicar a **Opção A (Avanço com Penalidade)** para rodízios:
     - O morador inadimplente recebe o registro de **FALHA** (`FAILED`) no histórico, impactando negativamente suas estatísticas e a pontuação de "Saúde da Convivência".
     - O rodízio **avança imediatamente para o próximo morador** da fila para que a casa não fique desassistida nem a rotina travada.
     - Para tarefas diárias direcionadas (não rodízio): encerra o ciclo anterior com falha no histórico do responsável e reinicia a tarefa limpa para o novo dia.
4. **Governança de Perdão de Falhas pelo Admin Geral:**
   - Para evitar penalidades injustas (doença, imprevisto ou ausência justificada), o **Admin Geral** deve ter a prerrogativa de **"Perdoar Falha"** (`forgiveFailure`), anulando a penalidade e recalculando a métrica de convivência.

---

## 2. Solução Proposta

### 2.1 Regra Universal de Conclusão de Tarefas (Frontend & Backend)
- **Frontend ([`Modals.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Modals.tsx) & [`TasksRotationsView.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx)):**
  - Passar `currentUserId`, `currentUserName` e `currentUserRole` para o `NotificationsDrawer`.
  - Definir a condição estrita de conclusão permitida:
    ```tsx
    const isGeneralAdmin = currentUserRole === 'Admin Geral' || currentUserRole === 'ADMIN';
    const isAssignedUser = Boolean(
      (currentUserId && task.responsibleId && task.responsibleId === currentUserId) ||
      (currentUserId && task.nextMemberId && task.nextMemberId === currentUserId) ||
      (effectiveUserName && task.responsible && task.responsible.trim().toLowerCase() === effectiveUserName.trim().toLowerCase()) ||
      (effectiveUserName && task.nextMember && task.nextMember.trim().toLowerCase() === effectiveUserName.trim().toLowerCase())
    );
    const canComplete = isAssignedUser || isGeneralAdmin;
    ```
  - Se `canComplete === true`: Botão "Concluir" ativo (`bg-[#16302e]` ou verde).
  - Se `canComplete === false`: Botão desabilitado em cinza com ícone de cadeado (`lock`), cursor não permitido e tooltip: `"Aguardando confirmação de [Nome do Responsável]"`.
- **Backend ([`tasks.service.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.service.ts)):**
  - Em `completeTask(taskId, userId, pin, userRole)`:
    - Obter o papel do usuário. Se `isGeneralAdmin === true`, autorizar a conclusão mesmo que `idResponsavelValido !== userId`.
    - Caso não seja o responsável e não seja Admin Geral: retornar `403 FORBIDDEN_TASK_COMPLETION`.

### 2.2 Expiração Automática Diária & Avanço com Penalidade (Opção A)
- **Backend (`DailyTaskLifecycleService` ou método em `tasks.service.ts`):**
  - Implementar verificação automática de ciclo diário (executada em rotina periódica e acionada on-the-fly em `getHouseTasks`):
    - Identificar tarefas diárias ativas cujo ciclo anterior não foi concluído (data de criação/ciclo anterior ao dia corrente às 00:00).
    - Para cada tarefa vencida:
      1. Identificar o morador responsável daquele ciclo.
      2. Registrar em `ActivityLog` a ação `FAILED` com comentário `"[Nome] não concluiu a tarefa diária [Título] no prazo."`.
      3. Se for **tarefa de rodízio (Opção A)**:
         - Avançar circularmente o `rotation_index` para o próximo participante ativo da fila (respeitando ordem A-Z e salto de férias).
         - Atualizar a tarefa para status `OPEN`.
         - Emitir eventos WebSocket (`house:rotation_advanced`, `task:updated`).
      4. Se for **tarefa direcionada comum**:
         - Restaurar a tarefa para `OPEN` com o novo ciclo do dia corrente.
- **Estatísticas de Convivência ([`statistics.service.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/statistics/statistics.service.ts)):**
  - O log `FAILED` automaticamente impacta a taxa de conclusão e a penalidade no Índice de Harmonia da Residência e na contagem de falhas do morador.

### 2.3 Prerrogativa do Admin Geral: Perdoar Falha (`POST /api/tasks/:id/forgive-failure`)
- Apenas o **Admin Geral** (`role === 'ADMIN' | 'Admin Geral'`) pode acionar o perdão de uma falha registrada.
- Ao perdoar a falha:
  - O registro de `ActivityLog` (`FAILED`) correspondente tem seu tipo alterado para informativo ou é neutralizado do cômputo de penalidade.
  - Registra-se auditoria: `"[Admin Geral] perdoou a falha de [Nome] na tarefa [Título]"`.
  - Recalcula automaticamente as estatísticas da residência.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Eliminação definitiva da vulnerabilidade no drawer de alertas: ninguém conclui tarefas alheias.
  - Alinhamento pleno com a hierarquia da residência: o Admin Geral retém poder de supervisão e conclusão executiva.
  - Rotina de tarefas auto-sustentável: a casa não acumula sujeira nem fica paralisada quando um morador falha, pois o rodízio avança deterministamente (Opção A).
  - Justiça na convivência: faltas são contabilizadas com rigor, mas o Admin Geral tem ferramentas nativas para relevar justificativas de força maior.
- **Desvantagens / Riscos:**
  - Moradores com tarefas de rodízio devem ser alertados que o vencimento sem execução gerará penalidade em seu score pessoal de convivência.

---

## 4. Critérios de Aceitação
- [x] No drawer lateral de alertas (`NotificationsDrawer`), o botão "Concluir" está ativo exclusivamente para o morador designado da tarefa ou para o Admin Geral.
- [x] Para qualquer outro morador, o botão "Concluir" no drawer de alertas é exibido bloqueado com cadeado e tooltip explicativo.
- [x] No quadro de tarefas (`TasksRotationsView.tsx`), o Admin Geral consegue concluir tarefas se necessário.
- [x] O backend valida autorização em `completeTask`: responsável direto OU Admin Geral permitido; terceiros bloqueados com 403.
- [x] Motor de expiração identifica tarefas diárias vencidas e registra `FAILED` para o morador inadimplente.
- [x] Em tarefas de rodízio, a expiração diária avança a vez para o próximo participante ativo da fila (Opção A).
- [x] Rota exclusiva para Admin Geral perdoar falha registrada (`POST /api/tasks/:id/forgive-failure`).
- [x] Testes automatizados de permissão e avanço com falha passando com 100% de sucesso.
- [x] Typecheck e build íntegros via `rtk`.
- [x] Documentação `/docs` sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
- [x] 1. **Frontend - Drawer de Alertas ([`Modals.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/components/Modals.tsx)):**
   - Adicionar props `currentUserId`, `currentUserName`, `currentUserRole` em `NotificationsDrawer`.
   - Aplicar verificação `canComplete = isAssignedUser || isGeneralAdmin` no botão "Concluir" da aba de alertas com fallback bloqueado.
- [x] 2. **Frontend - Integração em [`App.tsx`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx):**
   - Repassar dados do usuário autenticado para `NotificationsDrawer`.
   - Ajustar `handleTaskStatusChange` para enviar `userRole` e validar se quem está executando é o responsável ou o Admin Geral.
- [x] 3. **Backend - Autorização Executiva em `completeTask` ([`tasks.service.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.service.ts)):**
   - Permitir que Admin Geral conclua qualquer tarefa da casa.
- [x] 4. **Backend - Motor de Expiração Diária & Opção A ([`tasks.service.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.service.ts) / [`tasks.controller.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.controller.ts)):**
   - Adicionar método `processDailyTaskExpirations(houseId)`: registra `FAILED` e avança rodízio (Opção A).
   - Adicionar rota e método `forgiveFailure(taskId, logId, adminUserId, adminRole)`.
- [x] 5. **Backend - Testes Unitários ([`task.permissions.test.ts`](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/tests/unit/task.permissions.test.ts)):**
   - Cobrir permissão de conclusão para responsável e Admin Geral, e bloqueio de terceiros.
   - Cobrir avanço com penalidade (Opção A) e perdão de falha por Admin Geral.
- [x] 6. **Validação Técnica:**
   - Executar `rtk npm run typecheck` e `rtk npm test` no backend e frontend.
- [x] 7. **Sincronização com `/docs`:**
   - Atualizar `docs/product/tasks-rotation.md`, `docs/pages/tasks-rotation.md`, `docs/components/modals.md`, `docs/copywriting/microcopy.md` e `docs/integrations/api-contracts.md`.

---

## 6. Validação e Testes
- [x] Typecheck do backend (`rtk npm run typecheck` na pasta `backend`)
- [x] Typecheck do frontend (`rtk npm run typecheck` na pasta `frontend`)
- [x] Testes unitários do backend (`rtk npm test` na pasta `backend`)
- [x] Build de produção do frontend (`rtk npm run build` na pasta `frontend`)

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md`
- [x] `docs/pages/tasks-rotation.md`
- [x] `docs/components/modals.md`
- [x] `docs/copywriting/microcopy.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/tasks/2026-09-08-governanca-conclusao-expiracao-rodizio-opcao-a.md`
