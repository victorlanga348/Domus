# Task: Bloqueio de Giro de Rodízio Fora da Vez
**Data:** 2026-09-08  
**Status:** Concluída  
**Specs Impactadas:**  
- `[[docs/product/tasks-rotation.md]]`
- `[[docs/pages/tasks-rotation.md]]`
- `[[docs/copywriting/microcopy.md]]`
- `[[docs/integrations/api-contracts.md]]`
- `[[docs/documentation-governance.md]]`

---

## 1. Contexto & Problema
Na aba "Rodízios" da tela de Tarefas & Rodízio (`TasksRotationsView.tsx`), os cartões de rodízio exibem a fila de participantes e um botão **"Girar"** (`onRotateNext`).
No entanto:
1. **Ausência de Trava de Autorização no Frontend:** O botão "Girar" está sempre ativo para qualquer usuário logado na residência, independentemente de quem detém a vez ativa (`isNext: true`). Qualquer morador pode clicar e girar a escala de rodízio de outrem, desorganizando a ordem do turno doméstico.
2. **Ausência de Validação na Rota/Ação:** A função `handleRotateNext` no frontend avança a fila em memória e dispara WebSocket sem validar se o requisitante é o responsável atual da rodada.
3. **Ausência de Persistência no Backend:** O avanço de rodízio não possui endpoint dedicado com checagem estrita de autorização (403 Forbidden) e persistência de `rotation_index` no banco de dados.
4. **Inconsistência de UI/UX:** Na aba principal de tarefas, o botão "Concluir" e o botão "Pular" já respeitam a governança de vez do morador (ficando bloqueados com cadeado e tooltip quando não for a vez da pessoa). A aba "Rodízios" deve seguir exatamente o mesmo padrão de design e segurança.

---

## 2. Solução Proposta

### 2.1 Governança Visual no Frontend (`TasksRotationsView.tsx`)
- Na lista de rodízios (`activeTab === 'rotations'`), calcular deterministicamente para cada rodízio se o morador logado é o responsável ativo:
  ```tsx
  const nextUser = rot.queue.find((q) => q.isNext);
  const isMyTurn = Boolean(
    (currentUserId && nextUser?.id && nextUser.id === currentUserId) ||
    (effectiveUserName && nextUser?.name && nextUser.name.trim().toLowerCase() === effectiveUserName.trim().toLowerCase()) ||
    (effectiveUserName && rot.nextMember && rot.nextMember.trim().toLowerCase() === effectiveUserName.trim().toLowerCase())
  );
  ```
- **Se `isMyTurn === true`:** O botão **"Girar"** permanece ativo (`bg-[#7b5800] hover:bg-[#5d4200] active:scale-[0.96] text-white`).
- **Se `isMyTurn === false`:** O botão **"Girar"** é desabilitado (`disabled`, `bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80`), com ícone de cadeado (`lock`) e tooltip idêntico ao padrão oficial: `"Aguardando a vez de [Nome do Morador da Vez]"`.

### 2.2 Validação e Sincronização no `App.tsx`
- No handler `handleRotateNext(rotationId)`:
  - Validar se o usuário logado (`authUser`) é de fato o responsável ativo daquele rodízio. Se não for, bloquear o avanço e emitir notificação toast explicativa.
  - Atualizar a lista de `rotations` avançando o primeiro da fila circular.
  - Atualizar simultaneamente a lista de `tasks` para manter sincronizado o `nextMember` e `nextMemberAvatar` do cartão de tarefa correspondente.
  - Chamar a API backend (`tasksApi.rotateTask`) para persistir o novo `rotation_index` no PostgreSQL e registrar a auditoria em `ActivityLog`.
  - Emitir evento via WebSocket (`house:rotation_advanced`).

### 2.3 Endpoint Seguro no Backend (`/api/tasks/:id/rotate`)
- Adicionar rota `POST /api/tasks/:id/rotate` (e alias `PATCH /api/tasks/:id/rotate`).
- **Validação de Permissão (403 Forbidden):**
  - Identificar o responsável ativo atual através de `rotationService.getCurrentResponsible(taskId)`.
  - Se `userId !== currentResponsible.id`, rejeitar imediatamente com `403 FORBIDDEN_TASK_ROTATION` e mensagem `"Apenas a pessoa da vez no rodízio pode girar a escala."`.
- **Persistência Determinística:**
  - Avançar `rotation_index` via `rotationService.rotateTask(taskId)`.
  - Registrar log de auditoria em `ActivityLog` (`ROTATED`).
  - Emitir broadcast via WebSocket para a residência (`task:updated` e `house:rotation_advanced`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Resolução definitiva do problema reportado pelo usuário: ninguém consegue burlar a escala ou passar a vez de outro morador.
  - Coerência total com a regra de negócio central de tarefas descrita em `docs/product/tasks-rotation.md`.
  - Consistência de interface (mesmo padrão de botão bloqueado com cadeado e tooltip explicativo).
  - Persistência real no banco de dados e sincronização via WebSocket para múltiplos aparelhos em tempo real.
- **Desvantagens / Riscos:**
  - Em ambientes de testes onde um morador precisa testar o giro de rodízio de outro, será necessário selecionar/logar com o respectivo morador (ou usar o botão "Editar Rodízio" reservado para administradores).

---

## 4. Critérios de Aceitação
- [x] Na aba "Rodízios", o botão "Girar" está habilitado apenas para o participante cuja vez é a atual (`isNext: true`).
- [x] Para qualquer outro morador (ou usuário sem a vez), o botão "Girar" é exibido desabilitado com ícone de cadeado e tooltip `"Aguardando a vez de [Nome]"`.
- [x] A tentativa de acionar `handleRotateNext` fora da vez é bloqueada no frontend com mensagem toast.
- [x] Endpoint `POST /api/tasks/:id/rotate` bloqueia com HTTP 403 chamadas realizadas por quem não detém a vez.
- [x] O avanço legítimo persiste o novo `rotation_index` no banco de dados e atualiza tanto os rodízios quanto os cartões de tarefas.
- [x] Testes unitários cobrindo as regras de permissão de giro (sucesso para o membro da vez, 403 para terceiros).
- [x] Testes de validação técnica (`rtk npm run typecheck`, `rtk npm test`) com 0 erros.
- [x] Documentação `/docs` sincronizada.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend - Serviço, Controller & Rotas:**
   - Adicionar método `rotateTask(taskId: string, userId: string)` em `backend/src/modules/tasks/tasks.service.ts` com validação de `idResponsavelValido === userId` (403).
   - Adicionar método `rotateTask` em `backend/src/modules/tasks/tasks.controller.ts`.
   - Adicionar rota `POST /api/tasks/:id/rotate` em `backend/src/modules/tasks/tasks.routes.ts`.
2. **Backend - Testes Unitários:**
   - Adicionar suíte de testes de permissão de giro em `backend/tests/unit/task.permissions.test.ts`.
3. **Frontend - Integração de API:**
   - Adicionar método `rotateTask(taskId: string, userId: string)` em `frontend/src/features/tasks-rotation/api/tasksApi.ts`.
4. **Frontend - UI do Rodízio:**
   - Em `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`, aplicar verificação `isMyTurn` no botão "Girar", renderizando estado ativo ou bloqueado com tooltip.
   - Ajustar as chamadas no card da tarefa para direcionar a rotação para o rodízio correto correspondente à tarefa.
5. **Frontend - Estado & Governança:**
   - Em `frontend/src/App.tsx`, proteger `handleRotateNext` e sincronizar `tasks` e chamada `tasksApi.rotateTask`.
6. **Validação Técnica:**
   - Executar `rtk npm run typecheck` e testes automatizados.
7. **Sincronização de Docs:**
   - Atualizar `docs/product/tasks-rotation.md`, `docs/pages/tasks-rotation.md`, `docs/copywriting/microcopy.md` e `docs/integrations/api-contracts.md`.

---

## 6. Validação e Testes
- [x] Typecheck do backend (`rtk npm run typecheck` na pasta `backend`)
- [x] Typecheck do frontend (`rtk npm run typecheck` na pasta `frontend`)
- [x] Testes unitários do backend (`rtk npm test` na pasta `backend`)
- [x] Build do frontend (`rtk npm run build` na pasta `frontend`)

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md`
- [x] `docs/pages/tasks-rotation.md`
- [x] `docs/copywriting/microcopy.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/tasks/2026-09-08-bloqueio-giro-rodizio-fora-da-vez.md`
