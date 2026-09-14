# Task: Suporte a Tarefas Livres (Conclusão Comunitária)
**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
No modal de criação de tarefas (`TasksRotationsView.tsx`), existe a opção de atribuição `"Qualquer pessoa (Livre)"`. Contudo:
1. O frontend não possui tratamento para `"Qualquer pessoa"` no cálculo de `taskParticipantIds`, caindo em fallback para o ID do próprio criador (`[authUser.id]`).
2. A renderização do botão de conclusão no card da tarefa e no drawer de alertas exige estritamente que `task.nextMemberId === currentUserId` ou `task.nextMember === currentUserName` (ou que seja Admin Geral). Como `task.nextMember` é exibido como `"Qualquer pessoa"` e `nextMemberId` fica indefinido, o botão é renderizado desabilitado com cadeado (`lock`) para todos os moradores comuns.
3. No backend (`tasks.service.ts`), a rota `completeTask` valida a permissão apenas contra o responsável da rotação, o único participante ou o criador (`task.creator_id`), rejeitando qualquer outro morador com `403 Forbidden` (`FORBIDDEN_TASK_COMPLETION`).
4. Na documentação (`docs/product/tasks-rotation.md`), a regra 4.1 não prevê a categoria de tarefas comunitárias/livres.

---

## 2. Solução Proposta
1. **Modelagem de Tarefas Livres:**
   - Tarefas livres são caracterizadas por `participant_ids: []` (sem lista restritiva de participantes) e `is_rotation: false`.
   - No frontend, o responsável é exibido como `"Livre"` (com badge visual de tarefa livre/comunitária).
2. **Autorização de Conclusão no Backend:**
   - Em `tasks.service.ts` (`completeTask`), se a tarefa não possui participantes (`task.participants.length === 0`), ela é classificada como **Tarefa Livre**.
   - Qualquer morador autenticado pertencente à mesma residência (`task.house_id === user.house_id` ou Admin Geral) tem autorização para concluí-la.
   - O `ActivityLog` registra `${user.name} concluiu a tarefa livre "${task.title}"`.
3. **Frontend (Interface e Botão de Conclusão):**
   - Ao selecionar `"Qualquer pessoa (Livre)"` no modal de criação/edição:
     - `participantIds` é enviado como `[]` (array vazio).
     - `nextMember` é definido como `'Livre'` e `nextMemberId` como `undefined`.
   - Na checagem de permissão (`TasksRotationsView.tsx` e `Modals.tsx`):
     - Se `task.isFree` ou (`!task.isRotation && (!task.participantIds || task.participantIds.length === 0) && (task.nextMember === 'Livre' || task.nextMember === 'Qualquer pessoa')`), qualquer morador da casa visualiza o botão **"Concluir"** habilitado.
4. **Mapeamento e Sincronização:**
   - `mapBackendTaskToHouseTask` preserva a identificação de tarefa livre quando `participants.length === 0`.
   - Não penaliza o criador em expirações diárias automáticas (`processDailyExpirations`).

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Corrige a frustração do usuário onde uma opção existente na UI não funcionava.
  - Oferece flexibilidade operacional para tarefas cotidianas da casa sem dono fixo (ex: recolher lixo comum, trocar toalha, comprar sal).
  - Mantém a segurança estrita de isolamento por residência (`house_id`) sem comprometer as travas de tarefas direcionadas ou de rodízio.
- **Desvantagens / Riscos:**
  - Sem um responsável fixo, se nenhum morador assumir a tarefa, ela pode permanecer pendente sem um responsável cobrável diretamente (comportamento inerente a tarefas comunitárias).

---

## 4. Critérios de Aceitação
- [x] Ao criar uma tarefa selecionando "Qualquer pessoa (Livre)", o payload enviado ao backend possui `participant_ids: []`.
- [x] Qualquer morador membro da residência visualiza o botão "Concluir" ativo e pode clicar para concluir a tarefa.
- [x] O backend aceita a requisição `POST /api/tasks/:id/complete` disparada por qualquer morador da residência quando a tarefa não possui participantes (`task.participants.length === 0`).
- [x] Usuários que não pertençam à residência recebem erro 403.
- [x] O histórico (`ActivityLog`) registra o morador real que concluiu a tarefa comunitária.
- [x] Tarefas direcionadas (1 participante) e de rodízio (>1 participantes) continuam com suas travas estritas de permissão inalteradas.
- [x] Documentação em `docs/product/tasks-rotation.md` e `docs/integrations/api-contracts.md` atualizada refletindo a regra de tarefas livres.
- [x] Testes unitários do backend cobrem o cenário de conclusão de tarefas livres por moradores comuns.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Atualização da Especificação (/docs):**
   - Atualizar `docs/product/tasks-rotation.md` adicionando a regra de Tarefas Livres / Comunitárias na Seção 4.1.
   - Atualizar `docs/integrations/api-contracts.md` documentando `participant_ids: []` e autorização aberta na conclusão.
2. **Backend:**
   - Em `backend/src/modules/tasks/tasks.service.ts`:
     - Ajustar `completeTask` para identificar tarefas com `participants.length === 0` como tarefas livres e permitir conclusão por qualquer membro da residência.
     - Ajustar `processDailyExpirations` para não atribuir falha individual ao criador em tarefas livres.
   - Em `backend/tests/unit/task.permissions.test.ts`:
     - Adicionar testes unitários validando que moradores comuns podem concluir tarefas sem participantes (`participants: []`), enquanto moradores de fora da casa continuam bloqueados.
3. **Frontend:**
   - Em `frontend/src/features/tasks-rotation/components/TasksRotationsView.tsx`:
     - Ajustar `handleCreateTask` para enviar `participantIds: []` e `nextMember: 'Livre'` quando `selectedMember === 'Qualquer pessoa'`.
     - Atualizar a condição do botão "Concluir" para habilitar quando a tarefa for livre.
   - Em `frontend/src/components/Modals.tsx`:
     - Atualizar `canComplete` no Drawer de Alertas para habilitar tarefas livres para qualquer membro da residência.
   - Em `frontend/src/App.tsx`:
     - Em `mapBackendTaskToHouseTask`: tratar tarefas com 0 participantes como livres (`nextMember: 'Livre'`, `isFree: true`), sem fallback indevido para o criador.
     - Em `handleAddTask`: não sobrescrever `participantIds: []` com `[authUser.id]` quando for tarefa livre.
4. **Validação Técnica:**
   - Executar suite de testes do backend (`rtk npm test` ou node test runner).
   - Executar typecheck no frontend e backend.

---

## 6. Validação e Testes
- [x] Typecheck do frontend (`rtk npm run build` sem erros)
- [x] Testes unitários de permissão do backend (`rtk npm test` - 67 testes passando)
- [x] Build do backend (`rtk npm run build` sem erros)

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` atualizado
- [x] `docs/integrations/api-contracts.md` atualizado
- [x] Matriz de impacto validada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
