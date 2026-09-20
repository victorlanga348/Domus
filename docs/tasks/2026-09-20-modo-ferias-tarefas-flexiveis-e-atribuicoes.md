# Task: Sincronização do Modo Férias, Tarefas Flexíveis, Remoção de Horário de Aviso e Liberação de Tarefas Direcionadas
**Data:** 2026-09-20  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/architecture/data-model.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema

1. **Dessincronização no Retorno do Modo Férias:**
   - Ao ativar o modo férias, o morador é pulado das tarefas de rodízio, mas ao desativar o modo férias, a interface não recalcula as filas reativamente nem atualiza as tarefas atribuídas de imediato sem recarregar a página.
   - A persistência no banco necessita de sincronizar tanto a tabela `users` quanto a tabela de vínculo `house_members` e emitir evento via WebSocket.

2. **Rigidez de Turno e Frequência para Tarefas Esporádicas:**
   - Atualmente, todas as tarefas exigem a seleção de turno (Manhã, Tarde, Noite) e frequência periódica (Diária, Semanal, Mensal).
   - Existem tarefas domésticas que não possuem horário específico nem periodicidade fixa (são realizadas quando necessário / quando bem entender ao longo do dia).

3. **Poluição Visual com Horário Estático de Aviso:**
   - O campo "Aviso Prévio / Lembrete" nos formulários e cards de tarefas é redundante, visto que o ecossistema de alertas é gerido pelo centro de notificações e eventos em tempo real.

4. **Bloqueio de Tarefas Direcionadas Durante Férias:**
   - Tarefas atribuídas a um único morador ficam travadas quando este entra em férias, impedindo que outros membros da residência possam realizá-las e concluí-las.
   - Ao entrar em férias, essas tarefas direcionadas devem ficar temporariamente "Livres" para qualquer pessoa da casa fazer; ao retornar das férias, devem voltar automaticamente a ficar sob o cargo do responsável.

---

## 2. Solução Proposta

### 2.1 Sincronização Completa do Modo Férias (Backend & Frontend)
- **Backend:** Atualizar `toggleVacation` em `AuthService` e `UserService` com transação Prisma atualizando `User.vacation_mode` e `HouseMember.vacation_mode` (para a residência ativa), disparando o evento WebSocket `member:vacation_changed`.
- **Frontend:**
  - `handleToggleVacationMode`: Atualização otimista imediata de `familyMembers` e `authUser`, chamada assíncrona ao backend e recarregamento automático das tarefas (`tasksApi.getTasks`).
  - Mapeadores (`mapBackendTaskToHouseTask` e `mapBackendTasksToRotations`): Cruzar o identificador de cada participante com o estado reativo atual de `familyMembers` para garantir cálculo instantâneo.
  - Listener WebSocket `onVacationChanged`: Atualizar o estado e remapear as tarefas sem dependência de closures desatualizadas.

### 2.2 Suporte a Tarefas Flexíveis / Sem Turno ou Periodicidade Fixa
- **Backend & Schema:** Suporte aos valores `FLEXIBLE` para `Shift` e `Frequency` (ou tratamento semântico de turno livre e frequência sob demanda).
- **Frontend:**
  - Adicionar opção "Qualquer Horário / Flexível" na seleção de turno.
  - Adicionar opção "Quando necessário / Livre" na seleção de frequência.
  - Exibição limpa nos cards de tarefas e filtros da UI (sem forçar badges de turnos específicos).

### 2.3 Remoção do Horário de Aviso Estático
- Remover o campo "Aviso Prévio / Lembrete" (`advanceNoticeOption`, `customAdvanceNotice`) do modal de criação/edição de tarefas e dos cards de exibição.
- O sistema de alertas e lembretes passa a operar exclusivamente via central de notificações e eventos de urgência.

### 2.4 Liberação Temporária de Tarefas Direcionadas em Férias
- **Backend (`tasks.service.ts`):**
  - No método `completeTask`, se a tarefa tiver 1 participante e este morador estiver com `vacation_mode: true`, a tarefa é tratada como temporariamente livre, permitindo que qualquer membro ativo da casa a conclua com registro de log explícito.
- **Frontend (`mapBackendTaskToHouseTask` & `TasksRotationsView`):**
  - Se o único participante estiver em férias, a tarefa é exibida com status/badge de "Livre (Responsável em férias)", liberando o botão de conclusão para os demais membros.
  - Ao desativar o modo férias, a tarefa volta imediatamente a ficar sob a responsabilidade exclusiva do titular.

---

## 3. Análise de Trade-offs

- **Vantagens:**
  - Eliminação de bloqueios desnecessários na rotina da casa durante ausências de moradores.
  - Flexibilidade total para cadastrar afazeres espontâneos sem forçar horários arbitrários.
  - Interface mais limpa e focada, sem campos legados de aviso estático.
  - Reatividade perfeita no Frontend sem necessidade de refresh manual.
- **Desvantagens / Riscos:**
  - Necessidade de garantir que os testes unitários de permissão de tarefas cubram tanto moradores ativos quanto em férias para tarefas com 1 participante.

---

## 4. Critérios de Aceitação

- [x] Ao desativar o Modo Férias, o morador volta imediatamente à fila de rodízio e às tarefas de seu cargo sem necessidade de recarregar a página.
- [x] Tarefas podem ser criadas com Turno "Livre / Qualquer horário" e Frequência "Quando necessário / Livre".
- [x] O campo de "Aviso Prévio / Lembrete" foi completamente removido da criação/edição e dos cards de tarefas.
- [x] Tarefas direcionadas a um único morador ficam abertas/livres para qualquer morador concluir enquanto o responsável estiver em férias.
- [x] Ao desativar o Modo Férias, tarefas direcionadas voltam automaticamente ao responsável titular.
- [x] Todos os testes unitários do backend passam com sucesso (`rtk npm run test:unit` - 74/74 testes).
- [x] Typecheck do frontend e backend passam sem erros.

---

## 5. Plano de Implementação (Passo a Passo)

1. **Backend:**
   - Atualizar `auth.service.ts` e `auth.controller.ts` para persistir `vacation_mode` em `User` e `HouseMember` e emitir WebSocket.
   - Atualizar `tasks.service.ts` para permitir conclusão de tarefas individuais quando o titular estiver em férias.
   - Atualizar/Adicionar testes unitários em `task.permissions.test.ts` e `rotation.service.test.ts`.
2. **Frontend:**
   - Atualizar tipos em `types.ts` (remoção de `advanceNotice`, adição de opções flexíveis de período/frequência).
   - Atualizar `App.tsx` (`handleToggleVacationMode`, `mapBackendTaskToHouseTask`, `mapBackendTasksToRotations`, `onVacationChanged`).
   - Atualizar `TasksRotationsView.tsx` e `Modals.tsx` para remover campos de aviso prévio e adicionar opções de turno/frequência flexíveis.
3. **Validação & Governança:**
   - Executar testes automatizados com `rtk`.
   - Sincronizar documentação em `/docs`.
