# Task: Consistência Centralizada de Dados da Residência & Correção do Layout Mobile e Compartilhamento
**Data:** 2026-09-04  
**Status:** Concluído  
**Specs Impactadas:**  
- `[[docs/pages/settings.md]]`
- `[[docs/pages/dashboard.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/architecture/data-model.md]]`

---

## 1. Contexto & Problema
1. **Inconsistência Crítica de Dados entre Moradores:**
   - Atualmente, tarefas, recados do mural, histórico/notificações e regras da casa estavam sendo gravados apenas no `localStorage` do navegador do usuário que os criava.
   - Consequência: Morador A criava uma tarefa ou recado no seu celular, e Morador B não visualizava nada no seu computador ou celular.
   - As notificações eram discrepantes (cada um recebia apenas logs locais).
   - As estatísticas eram computadas estritamente a partir do `localStorage` individual, gerando métricas divergentes e individualizadas em vez de métricas compartilhadas da residência.
2. **Layout Quebrado do Botão "Regenerar" no Celular:**
   - Em telas estreitas (360px a 414px), os três botões ("Copiar", "Compartilhar" e "Regenerar") ficavam espremidos lado a lado com `flex-1`, quebrando o texto em várias linhas e truncando o layout do botão.
3. **Botão "Compartilhar" Inoperante:**
   - A função `handleShareCode` engolia exceções em um `catch {}` vazio e falhava silenciosamente em navegadores ou conexões HTTP na rede local sem suporte a Web Share API, sem fornecer nenhum feedback visual nem fallback de cópia.

---

## 2. Solução Proposta

### 2.1 Centralização e Persistência no Backend (PostgreSQL como Fonte da Verdade)
1. **Tarefas Compartilhadas (`tasks`):**
   - No `App.tsx`, ao inicializar/selecionar a residência, buscar todas as tarefas persistidas via `tasksApi.getTasks(currentHouse.id, authUser.id)`.
   - Ao criar (`handleAddTask`): persistir no PostgreSQL via `tasksApi.createTask` com `house_id` da residência e emitir broadcast WebSocket.
   - Ao concluir/alterar status: persistir no banco via `tasksApi.completeTask` / `tasksApi.blockTask` e sincronizar em tempo real.
   - Ao excluir: chamar `tasksApi.deleteTask` no backend e emitir WebSocket.
2. **Histórico e Notificações Compartilhadas (`activityLogs`):**
   - Ao carregar a residência, buscar o histórico oficial persistido via `GET /api/activity-logs?houseId=${currentHouse.id}`.
   - Ao registrar atividade (`recordHouseActivity`): persistir no banco via `POST /api/activity-logs` para que todos os membros da casa tenham o mesmo histórico de notificações.
3. **Mural da Casa Compartilhado (`muralNotes` / `BulletinBoard`):**
   - Criar endpoints `POST /api/dashboard/bulletin` e `DELETE /api/dashboard/bulletin/:id` no backend.
   - Sincronizar recados da casa do banco de dados na inicialização e em tempo real.
4. **Estatísticas Compartilhadas da Casa (`StatisticsView`):**
   - As métricas de harmonia, taxa de conclusão e contribuição por membro devem ser obtidas centralizadamente de `statisticsApi.getStatistics(currentHouseId, currentUserId)` (backend aggregation por residência), eliminando cálculos individuais de `localStorage`.

### 2.2 Layout Mobile Adaptativo dos Botões de Código
- Implementar `grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto`:
   - Mobile: [Copiar] e [Compartilhar] dividem a linha 1 (50% cada). [Regenerar Código] ocupa a linha 2 completa (`col-span-2`), com touch target confortável e texto completo `whitespace-nowrap`.
   - Desktop: Alinhamento horizontal tradicional lado a lado.

### 2.3 Ativação Robusta do Botão "Compartilhar"
- Payload rico com convite: `"Você foi convidado para a residência [Nome] no DOMUS! Use o código: CASA-XXXX para entrar. [Link]"`.
- Fallback automático para cópia na área de transferência com notificação Toast caso a Web Share API não seja suportada ou ocorra em contexto HTTP LAN.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **100% de Consistência:** Toda a casa compartilha exatamente as mesmas tarefas, notificações, mural e estatísticas.
  - **Multi-dispositivo Real:** Um morador cria no celular e o outro vê instantaneamente no tablet ou computador.
  - **Usabilidade Mobile Perfeita:** Fim de botões truncados ou quebras de palavras.
- **Desvantagens / Riscos:**
  - Dependência de rede para sincronização de novas tarefas.
  - **Mitigação:** O `localStorage` permanece como camada de cache e fallback offline resiliente.

---

## 4. Critérios de Aceitação
- [x] Tarefas criadas por um membro aparecem para todos os membros da mesma residência (persistência em PostgreSQL).
- [x] Conclusão e exclusão de tarefas refletem para todos os membros.
- [x] Notificações e logs de atividade da residência são centralizados e iguais para todos da casa.
- [x] Estatísticas da casa refletem as ações de todos os membros e são consistentes entre dispositivos.
- [x] Recados do mural persistem no banco de dados e são compartilhados.
- [x] O botão "Regenerar Código" no celular ocupa linha inteira (`col-span-2`) sem quebras.
- [x] O botão "Compartilhar" abre o share nativo ou copia a mensagem de convite com Toast explicativo.
- [x] Typecheck e testes passam 100% via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend (`backend/src/modules/dashboard/`):**
   - Adicionar métodos `createBulletinPost` e `deleteBulletinPost` no `DashboardService`, `DashboardController` e `dashboard.routes.ts`.
2. **Frontend (`frontend/src/App.tsx` & APIs):**
   - Em `App.tsx`:
     - Sincronizar tarefas (`tasksApi.getTasks`) e histórico de atividades (`GET /api/activity-logs`) ao carregar residência.
     - Atualizar `handleAddTask`, `handleDeleteTask`, `handleTaskStatusChange` e `recordHouseActivity` para persistir no backend.
     - Atualizar `handleAddMuralNote` e `handleDeleteMuralNote` para persistir no backend.
   - Em `StatisticsView.tsx`:
     - Priorizar e consolidar dados agregados da residência do backend.
   - Em `SettingsView.tsx`:
     - Atualizar grid responsivo dos botões do código (`grid grid-cols-2 sm:flex`).
     - Refatorar `handleShareCode` com fallback universal e toast.
   - Em `Modals.tsx`:
     - Ajustar responsividade do `ConfirmActionModal`.
3. **Validação & Testes:**
   - Executar `rtk npm run typecheck` no frontend e backend.
   - Executar `rtk npm test` no backend.
   - Executar `rtk npm run build` no frontend.
4. **Sincronização de Docs & Commit:**
   - Atualizar documentações em `/docs` e realizar commit em português.
