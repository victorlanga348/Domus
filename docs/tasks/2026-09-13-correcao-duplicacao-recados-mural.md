# Task: Correção da Duplicação de Recados no Mural
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/dashboard.md]]`, `[[docs/architecture/realtime-sync.md]]`

---

## 1. Contexto & Problema
Ao fixar um novo recado no mural ("Mural de Recados & Avisos"), o recado aparece duplicado na interface (surgem 2 post-its idênticos em vez de apenas 1).

### Causa-Raiz Investigada:
1. **Emissão Dupla de WebSocket (Frontend e Backend):**
   - O frontend chamava `emitNoteCreated(currentHouse.id, noteObj)` emitindo a nota com um ID temporário (`temp_n_...`) para o socket.
   - O backend controller (`dashboard.controller.ts`), ao receber o HTTP POST para salvar a mesma nota no banco, chamava `emitToHouse(houseId, 'house:note_created', ...)` emitindo a nota com o ID canônico do banco (`post.id`).
2. **Race Condition de Reconciliação entre Optimistic ID (`tempId`) e Server ID (`post.id`):**
   - O listener `onNoteCreated` do socket recebia a nota do backend com `post.id`.
   - O check `prev.some((n) => n.id === incomingNote.id)` falhava porque no estado local a nota ainda tinha o ID temporário (`temp_n_...`).
   - O listener adicionava a nota com `post.id` ao array de recados.
   - Poucos milissegundos depois, a resposta HTTP resolvia e renomeava a nota original de `tempId` para `post.id`.
   - O estado passava a conter dois recados com o mesmo conteúdo e mesmo `id` (`post.id`).

---

## 2. Solução Proposta
1. **Centralizar a Transmissão de Recados no Backend (Server-Authoritative):**
   - Remover a emissão de `emitNoteCreated` e `emitNoteDeleted` no frontend. Apenas o backend, após persistir a operação no banco de dados com ID canônico, deve transmitir os eventos `house:note_created` e `house:note_deleted` para os clientes da residência.
2. **Reconciliação e Idempotência no Frontend (`App.tsx`):**
   - No listener `onNoteCreated`, verificar se já existe uma nota temporária (`n.id.startsWith('temp_n_')`) com o mesmo conteúdo e reconciliá-la com o `incomingNote.id`, evitando inserir um segundo elemento.
   - Na resposta HTTP da criação de recado, verificar se a nota com `created.id` já foi adicionada/reconciliada pelo WebSocket antes de atualizar o array, prevenindo duplicações em qualquer ordem de chegada (seja o socket mais rápido ou o HTTP mais rápido).
3. **Normalização de Payload no Backend (`dashboard.controller.ts`):**
   - Garantir que o backend emita o campo `dateStr` e preserve atributos consistentes para o recado transmitido em tempo real.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Elimina 100% da duplicação de recados, tanto para o criador quanto para os demais moradores conectados na casa.
  - Mantém a latência zero percebida (atualização otimista imediata para o criador) sem efeitos colaterais de duplicação.
  - Elimina mensagens de socket redundantes trafegadas na rede.
- **Desvantagens / Riscos:**
  - Nenhuma; a sincronização em tempo real torna-se mais confiável e aderente às boas práticas de eventos server-driven.

---

## 4. Critérios de Aceitação
- [x] Ao fixar um recado no mural, exatamente 1 post-it é exibido na tela.
- [x] O recado permanece único após a resposta do backend e após recarregar a página.
- [x] Outros moradores conectados recebem exatamente 1 cópia do recado em tempo real.
- [x] Ao excluir um recado, o mesmo é removido de forma única e limpa.
- [x] Validações de typecheck e testes unitários passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Em `frontend/src/App.tsx`:
   - Remover chamada de `emitNoteCreated` no `handleAddMuralNote`.
   - Implementar reconciliação segura e idempotente em `onNoteCreated` e no retorno HTTP de `createBulletinPost`.
2. Em `backend/src/modules/dashboard/dashboard.controller.ts`:
   - Normalizar o payload emitido por `emitToHouse` para incluir `dateStr` compatível com a interface `MuralNote`.
3. Executar typechecks e testes unitários via `rtk`.
4. Atualizar spec com status de concluída e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend)
- [x] `rtk npm run typecheck` (Backend)
- [x] `rtk npm run test:unit` (Backend)

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-correcao-duplicacao-recados-mural.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
