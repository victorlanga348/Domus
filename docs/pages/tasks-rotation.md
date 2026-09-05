# Tela: Quadro de Tarefas & Rodízio

## 1. Objetivo da Tela
Gerenciamento operacional completo das rotinas domésticas, visualização de turnos, atribuições de rodízio e manipulação de locks de execução.

---

## 2. Estrutura e Seções do Layout

### 2.1 Barra de Ferramentas e Filtros
- Filtro por turno (`Todos`, `Manhã`, `Tarde`, `Noite`).
- Filtro por responsável (`Minhas Tarefas`, `Todos os Membros`).
- Botão primário: `[ + Nova Tarefa ]`.

### 2.2 Colunas / Painéis de Turno
Visualização em 3 colunas (Desktop) ou lista segmentada (Mobile):
- **Manhã:** Tarefas matinais com contadores de status.
- **Tarde:** Tarefas do meio do dia.
- **Noite:** Tarefas de encerramento da rotina.

### 2.3 Cartão de Tarefa (`Task Card`)
Cada cartão exibe:
- Título e categoria com ícone temático.
- Avatar e nome do responsável da vez (`currentAssignee`).
- Badge de status (`OPEN`, `LOCKED [Tempo Restante]`, `BLOCKED [Motivo]`, `COMPLETED`).
- Fila de próximos participantes no rodízio (ordem alfabética).
- Botões de ação contextuais:
  - Se `OPEN`:
    - **Para o Morador Responsável:** Botão `[ Concluir ]` verde ativo.
    - **Para Outros Moradores / Sub-Admin:** Botão desabilitado em cinza com tooltip: `"Aguardando confirmação de [Nome do Responsável]"`.
  - Se `COMPLETED`:
    - **Para Moradores Comuns:** Apenas o selo verde `"Concluída"` (sem botões de ação).
    - **Para Admin Geral e Sub-Admins:** Selo `"Concluída"` acompanhado de botão discreto `[ Reverter para Pendente ]`, abrindo modal de confirmação.

---

## 3. Persistência Centralizada & Sincronização em Tempo Real (PostgreSQL)
- **Fonte Canônica da Residência:** Tarefas não são mais armazenadas exclusivamente em navegadores individuais. O PostgreSQL é a fonte oficial da verdade sob a partição `house_id`.
- **Fluxos Centralizados:**
  - `GET /api/tasks?houseId=...`: Lista todas as tarefas ativas da residência na montagem da tela.
  - `POST /api/tasks`: Criação persistente no banco de dados vinculada aos membros e emissão imediata de evento `task:created` via WebSocket.
  - `PATCH /api/tasks/:id/complete` (alias `/api/tasks/:id/concluir`): Conclusão com validação restrita do morador responsável da vez e emissão de `task:status_changed`.
  - `PATCH /api/tasks/:id/revert` (alias `/api/tasks/:id/reverter`): Reversão de status exclusiva para Admin Geral e Sub-Admin com emissão de `task:status_changed`.
  - `DELETE /api/tasks/:id`: Exclusão persistente no banco e emissão de `task:deleted`.
  - `POST /api/activity-logs`: Registro oficial de conclusões, bloqueios, reversões e rotações, garantindo que o histórico e as notificações sejam idênticos em todos os aparelhos da mesma residência.
