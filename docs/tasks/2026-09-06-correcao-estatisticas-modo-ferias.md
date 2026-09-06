# Task: Correção da Contagem de Modo Férias nas Estatísticas e Bloqueio de Troca de Casa para Admin Geral
**Data:** 2026-09-06  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/reports-and-metrics.md]]`, `[[docs/pages/reports.md]]`, `[[docs/components/sidebar-header.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Problema
1. **Modo Férias nas Estatísticas**: Ao ativar ou desativar o "Modo Férias" no cabeçalho ou configurações, a tela de Estatísticas (`StatisticsView`) computava o evento como se o morador tivesse concluído duas tarefas domésticas.
   - **Frontend (`frontend/src/App.tsx`)**: O helper `recordHouseActivity` possuía o parâmetro `actionType` com valor padrão `'COMPLETED'`. Ao acionar `handleToggleVacationMode`, o helper era invocado sem `actionType`, assumindo `'COMPLETED'` e disparando uma chamada POST para `/api/activity-logs` com `action_type: 'COMPLETED'` e `task_id: undefined`. Eventos de sistema também sofriam do mesmo efeito colateral.
   - **Backend (`backend/src/modules/statistics/statistics.service.ts` e `dashboard.service.ts`)**: O serviço de estatísticas filtrava apenas `log.action_type === 'COMPLETED'`, sem verificar se o log possuía de fato um `task_id` válido. O dashboard computava `completedTodayCount` com a mesma carência de filtro.
2. **Troca de Residência pelo Admin Geral**: O Administrador Geral não pode abandonar ou alternar de residência (`switchHouse`) deixando a casa sem liderança quando houver outros moradores; ele deve obrigatoriamente transferir a liderança antes de trocar de residência.

---

## 2. Solução Proposta
1. **Backend - Filtro Estrito de Tarefas**:
   - Em `statistics.service.ts`, garantir que `monthLogs` (e consequentemente `completedLogs`, `failedCount`, `blockedCount`) exijam estritamente `task_id: { not: null }` (ou `Boolean(log.task_id)`), assegurando que eventos de sistema ou logs órfãos jamais incrementem a contagem de tarefas ou o índice de contribuição.
   - Em `dashboard.service.ts`, restringir a query `completedTodayCount` para `task_id: { not: null }`.
2. **Backend - Bloqueio de Troca de Residência para Admin Geral**:
   - Em `houses.service.ts` (`switchHouse`), validar se o usuário é `ADMIN` na sua residência atual e se existem outros moradores vinculados a ela. Caso positivo, rejeitar com erro `403` (`CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN`), exigindo a transferência prévia de liderança.
3. **Frontend - Desacoplamento de Logs de Sistema e Tarefas**:
   - Em `frontend/src/App.tsx`, remover o valor padrão `'COMPLETED'` do parâmetro `actionType` em `recordHouseActivity`. Tornar `actionType?: 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'LOCKED' | 'ROTATED'`.
   - Definir `type: isTaskCompleted ? 'task' : 'system'`.
   - Somente efetuar chamada para `activityLogsApi.createLog` se `actionType` estiver definido e houver `taskId` associado.
   - Em `handleToggleVacationMode`, garantir a sincronização com o endpoint oficial `tasksApi.toggleVacation(authUser.id)` no backend além do estado local.
   - Em `mapBackendLogToActivityLog`, mapear como `'task'` somente logs que possuam `log.action_type === 'COMPLETED' && Boolean(log.task_id)`.
4. **Frontend - Bloqueio de Troca de Casa pelo Admin Geral**:
   - Em `frontend/src/App.tsx` (`handleSwitchHouse`), verificar se o morador autenticado é o `Admin Geral` e se existem outros membros na residência. Se houver, impedir a troca de casa e exibir toast informando: `"Como Admin Geral, você não pode trocar de residência sem antes transferir a liderança."`
5. **Testes Automatizados**:
   - Adicionar teste unitário no backend validando que logs de atividade sem `task_id` são terminantemente ignorados no cálculo de estatísticas e métricas de contribuição.
   - Adicionar teste unitário validando a rejeição do switchHouse para Admin Geral quando existirem outros membros.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Corrige imediatamente a falha relatada pelo utilizador. O modo de férias deixa de contar como tarefa em qualquer cenário.
  - Impede que uma residência com múltiplos moradores fique órfã de Admin Geral por alternância desavisada de residência.
  - Elimina contaminação do banco de dados com falsos registros de tarefas concluídas provenientes de notificações de sistema.
  - Defesa em profundidade: tanto o backend quanto o frontend passam a validar as regras.
- **Desvantagens / Riscos:**
  - O Admin Geral precisará efetuar a transferência explícita de liderança antes de alternar de residência se a casa contiver outros moradores.

---

## 4. Critérios de Aceitação
- [x] Ao alternar (entrar e sair) do Modo Férias, o contador de tarefas concluídas do morador nas Estatísticas permanece inalterado.
- [x] O contador de tarefas concluídas hoje no Dashboard (`completed_today_count`) não é incrementado ao alternar o Modo Férias.
- [x] O badge e gaveta de notificações continuam registrando o aviso de ativação/desativação de férias normalmente via feed em tempo real.
- [x] O backend ignora qualquer `ActivityLog` cujo `task_id` seja nulo nos cálculos de `completedLogs`, `failedCount` e `blockedCount`.
- [x] O Admin Geral é impedido de trocar de residência caso haja outros membros na casa atual, tanto no frontend (aviso) quanto no backend (`403 CANNOT_SWITCH_HOUSE_AS_GENERAL_ADMIN`).
- [x] Moradores comuns ou administradores normais conseguem trocar de residência normalmente.
- [x] Testes automatizados unitários passam com 100% de sucesso.
- [x] Build e typecheck do Frontend e Backend compilam sem erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] **Backend**:
   - Atualizado `backend/src/modules/statistics/statistics.service.ts` adicionando `task_id: { not: null }` na busca de `monthLogs` e na filtragem de logs.
   - Atualizado `backend/src/modules/dashboard/dashboard.service.ts` adicionando `task_id: { not: null }` no count de `completedTodayCount`.
   - Atualizado `backend/src/modules/houses/houses.service.ts` bloqueando `switchHouse` para `ADMIN` com outros moradores.
   - Criado teste unitário em `backend/tests/unit/statistics.service.test.ts` cobrindo o isolamento de logs sem `task_id` e a regra de `switchHouse`.
2. [x] **Frontend**:
   - Atualizado `frontend/src/App.tsx`:
     - Refatorado `recordHouseActivity` para não assumir default `'COMPLETED'` e condicionar `activityLogsApi.createLog` à existência de `actionType` e `taskId`.
     - Atualizado `handleToggleVacationMode` para invocar `tasksApi.toggleVacation`.
     - Atualizado `handleSwitchHouse` para interceptar e alertar caso o `Admin Geral` tente trocar de residência com outros membros ativos.
     - Atualizado `mapBackendLogToActivityLog` para classificar como `'task'` somente logs com `task_id`.
3. [x] **Validação**:
   - Executado `rtk npm run test:unit` no backend (30/30 testes passando).
   - Executado `rtk npm run typecheck` no backend (0 erros) e no frontend (0 erros).
   - Executado `rtk npm run build` no frontend (sucesso).
4. [x] **Sincronização de Docs**:
   - Atualizados `docs/product/reports-and-metrics.md`, `docs/architecture/security.md`, `docs/components/sidebar-header.md` e `docs/tasks/2026-09-06-correcao-estatisticas-modo-ferias.md`.
5. [x] **Commit**:
   - Commit em português realizado após validação.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` no frontend (0 erros)
- [x] `rtk npm run typecheck` no backend (0 erros)
- [x] `rtk npm run test:unit` no backend (todos os 30 testes passando)
- [x] `rtk npm run build` no frontend (sucesso)

---

## 7. Sincronização com /docs
- [x] `docs/product/reports-and-metrics.md`
- [x] `docs/architecture/security.md`
- [x] `docs/components/sidebar-header.md`
- [x] `docs/tasks/2026-09-06-correcao-estatisticas-modo-ferias.md`
