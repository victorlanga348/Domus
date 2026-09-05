# Task: Regras de Permissão para Concluir e Reverter Tarefas & Adição Exclusiva de Membros (Backend & Frontend)
**Data:** 2026-09-05  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/architecture/security.md]]`
- `[[docs/copywriting/microcopy.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/pages/reports.md]]`
- `[[docs/pages/settings.md]]`

---

## 1. Contexto & Problema
1. **Baixas Indevidas de Tarefas:** Atualmente, qualquer morador autenticado podia marcar qualquer tarefa como concluída no backend via `PATCH /api/tasks/:id/complete` ou na interface, gerando risco de baixas indevidas por engano ou má-fé em tarefas atribuídas a outros residentes.
2. **Reversão de Tarefas (Desfazer Conclusão):** A reversão de tarefas concluídas não possuía rota oficial persistente no backend com trava de governança, permitindo que moradores comuns manipulassem o status ou causando descompasso entre frontend e backend. A regra de governança define que tanto o **Admin Geral** quanto os **Sub-Admins** possuem autoridade para cancelar/reverter tarefas concluídas, enquanto moradores comuns devem ser bloqueados.
3. **Adição de Novos Membros na Residência:** A inclusão de novos moradores deve ser rigidamente controlada. Nenhum morador comum (`Resident`, `Guest`) tem permissão de adicionar novos participantes; apenas o **Admin Geral** e os **Sub-Admins** (`Admin`) possuem privilégios para convidar ou adicionar novos membros.

---

## 2. Solução Proposta

### 2.1 Regras de Autorização & Trava de Backend
1. **Concluir Tarefa (`PATCH /api/tasks/:id/complete` e alias `/api/tasks/:id/concluir`):**
   - **Tarefa Direcionada (1 participante ou atribuição direta):** apenas o morador designado (`tarefa.responsavelId === usuarioAtual.id`).
   - **Tarefa de Rodízio (múltiplos participantes):** apenas o morador ativo da vez no turno atual (`rodizio.membroAtualId === usuarioAtual.id`, determinado pelo `RotationService` em ordem alfabética canônica A-Z com salto de férias).
   - **Trava de Segurança:** se outro usuário tentar concluir a tarefa, retornar HTTP `403 Forbidden` com payload:
     ```json
     { "error": "Apenas a pessoa designada para esta tarefa pode marcá-la como concluída." }
     ```
2. **Reverter Tarefa / Cancelar Tarefa Feita (`PATCH /api/tasks/:id/revert` e alias `/api/tasks/:id/reverter`):**
   - **Quem pode executar:** **Admin Geral** e **Sub-Admins** (`role === 'ADMIN'` ou `role === 'SUB_ADMIN'`).
   - **Trava Estrita:** Moradores comuns (`role === 'MEMBER'`) são barrados com HTTP `403 Forbidden`:
     ```json
     { "error": "Apenas administradores e o Admin Geral têm permissão para reverter uma tarefa concluída." }
     ```
   - **Efeito da Reversão:** atualiza o status no PostgreSQL para `OPEN`, limpa `locked_by_id = null`, `locked_at = null`, emite evento WebSocket (`task:status_changed`) e registra `ActivityLog` de auditoria.
3. **Adição de Membros:**
   - Moradores comuns são proibidos de registrar ou convidar novos participantes para a residência.
   - Apenas o **Admin Geral** e os **Sub-Admins** possuem permissão para convidar/adicionar membros.

### 2.2 Comportamento da Interface (Frontend UI/UX)
1. **Para o Morador Responsável (ou da vez no rodízio):**
   - Botão **"Concluir Tarefa"** exibido em verde ativo, com ícone de check e feedback interativo imediato.
2. **Para Outros Moradores:**
   - Botão de concluir exibido desabilitado (cinza neutro, `cursor-not-allowed`, `aria-disabled="true"`) com tooltip explicativo: `"Aguardando confirmação de [Nome do Responsável]"`.
3. **Quando a Tarefa já estiver Concluída:**
   - **Para Moradores comuns:** aparece exclusivamente o selo verde `"Concluída"` (sem botões de ação).
   - **Para Admin Geral e Sub-Admins:** aparece botão discreto (ícone/texto `"Reverter para Pendente"`), seguido de um modal de confirmação elegante antes da requisição.
4. **Controle de Adição de Membros:**
   - Botões e menus de adicionar/convidar membros ficam ocultos para moradores regulares (`Resident`), permanecendo visíveis e funcionais exclusivamente para o Admin Geral e Sub-Admins (`Admin`).
   - Trava de proteção em nível de handler (`handleAddFamilyMember`) impedindo execução não autorizada.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Prevenção de Fraudes e Erros Acidentais:** Bloqueio mandatório tanto no backend quanto no frontend impede baixas indevidas de tarefas de terceiros.
  - **Transparência e UX sem Frustração:** O tooltip explica com clareza o motivo de o botão estar bloqueado.
  - **Flexibilidade de Gestão Doméstica:** Permitir que Sub-Admins também cancelem tarefas concluídas evita gargalos caso o Admin Geral esteja ocupado.
  - **Segurança de Acesso:** Manter a adição de novos membros restrita a administradores protege a privacidade e as finanças da residência.
- **Desvantagens / Riscos:**
  - Se o responsável estiver ausente sem ativar o Modo Férias, ninguém mais pode dar baixa imediata na tarefa.
  - **Mitigação:** O morador pode ativar o Modo Férias para ser saltado, solicitar troca de turno (`requestSwap`), ou os administradores podem intervir gerenciando a tarefa.

---

## 4. Critérios de Aceitação
- [x] Endpoint `PATCH /api/tasks/:id/complete` bloqueia com `403 Forbidden` qualquer usuário que não seja o responsável direto ou o membro da vez no rodízio.
- [x] Endpoint `PATCH /api/tasks/:id/revert` aceita chamadas do Admin Geral e de Sub-Admins, rejeitando moradores comuns com `403 Forbidden`.
- [x] No frontend, o responsável visualiza o botão de conclusão verde e ativo.
- [x] No frontend, usuários que não são o responsável visualizam o botão desabilitado em cinza com o tooltip `"Aguardando confirmação de [Nome do Responsável]"`.
- [x] Tarefas concluídas exibem o selo verde "Concluída" sem botão para moradores comuns.
- [x] Admin Geral e Sub-Admins visualizam o botão "Reverter para Pendente" nas tarefas concluídas, com modal de confirmação.
- [x] Nenhum morador comum tem acesso a botões ou ações de adicionar novos membros (apenas Admin Geral e Sub-Admins).
- [x] Testes unitários do backend e checagem de tipos (`typecheck`) executados com 100% de sucesso via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend (`backend/src/modules/tasks/`):**
   - No `TaskRepository`: adicionar `revertStatus(taskId)` para redefinir a tarefa para `OPEN` e limpar locks.
   - No `TaskService`:
     - Em `completeTask`: resolver o responsável válido (se rodízio, via `RotationService.getCurrentResponsible`; se direcionada, participante único ou criador) e bloquear terceiros com `403 Forbidden`.
     - Implementar `revertTask(taskId, userId, userRole)`: autorizar `ADMIN` e `SUB_ADMIN`, barrar `MEMBER` com `403 Forbidden`, atualizar status e emitir log de atividade.
   - No `TaskController` e `tasks.routes.ts`:
     - Expor `PATCH /:id/complete`, `PATCH /:id/concluir`, `PATCH /:id/revert` e `PATCH /:id/reverter`.
2. **Frontend (`frontend/src/`):**
   - Em `tasksApi.ts`: implementar `revertTask(taskId, userId, userRole)`.
   - Em `TasksRotationsView.tsx`:
     - Aplicar lógica de permissão no botão de conclusão: ativo/verde para o responsável; desabilitado/cinza com tooltip `"Aguardando confirmação de [Nome]"` para terceiros.
     - Exibir selo verde `"Concluída"` quando a tarefa for concluída.
     - Exibir botão discreto de reversão para Admin Geral e Sub-Admin com modal de confirmação.
   - Em `ReportsView.tsx`:
     - Restringir ação de reversão a Admin Geral e Sub-Admin com modal de confirmação.
   - Em `App.tsx`:
     - Reforçar trava em `handleAddFamilyMember` impedindo moradores comuns de adicionar membros.
3. **Validação Técnica:**
   - Rodar testes unitários: `rtk npm --prefix backend run test:unit`.
   - Rodar typecheck em backend e frontend: `rtk npm --prefix backend run typecheck` e `rtk npm --prefix frontend run typecheck`.
4. **Sincronização de Docs:**
   - Atualizar `docs/product/tasks-rotation.md`, `docs/integrations/api-contracts.md`, `docs/architecture/security.md`, `docs/copywriting/microcopy.md`, `docs/pages/tasks-rotation.md`, `docs/pages/reports.md` e `docs/pages/settings.md`.

---

## 6. Validação e Testes
- [x] Typecheck / Lint sem erros (`rtk npm run typecheck`).
- [x] Testes unitários do backend executados com sucesso (`rtk npm run test:unit`).
- [x] Validação das interações e acessibilidade dos botões e modais.

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/architecture/security.md`
- [x] `docs/copywriting/microcopy.md`
- [x] `docs/pages/tasks-rotation.md`
- [x] `docs/pages/reports.md`
- [x] `docs/pages/settings.md`
