# Task: Implementação de Checklist e Lista de Compras no Mural de Recados
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
- O usuário notou a ausência de recados do tipo checklist (como "Lista de Compras"), que existiam nos mock data estáticos iniciais (`INITIAL_MURAL_NOTES`), mas deixaram de aparecer após a migração para a persistência real no PostgreSQL.
- O tipo TypeScript `MuralNoteItem` (`{ id, text, done }`) já existia em `types.ts`, porém:
  1. O modal de novo recado suportava apenas texto corrido em `textarea`.
  2. Os cards do mural renderizavam apenas texto simples (`note.content`).
  3. Não existia endpoint no backend nem evento de WebSocket para atualizar e marcar/desmarcar itens de um recado colaborativamente em tempo real.

---

## 2. Solução Proposta
1. **Modelo de Dados e Persistência Retrocompatível (Zero DB Migration):**
   - Utilizar a serialização de metadados em `content` na tabela `bulletin_board` do PostgreSQL.
   - Quando o recado for do tipo checklist, salvar o payload JSON estruturado:
     ```json
     {
       "type": "checklist",
       "title": "Lista de Compras",
       "text": "Itens para o jantar",
       "items": [
         { "id": "it_1", "text": "Leite de aveia", "done": false },
         { "id": "it_2", "text": "Café em grãos", "done": true }
       ],
       "color": "teal"
     }
     ```
   - O método `parseBulletinContent` converte automaticamente o payload para o formato esperado pelo frontend.
   - Recados de texto simples pré-existentes continuam funcionando 100% sem alterações.

2. **Endpoints & WebSocket Backend:**
   - Adicionar rota `PATCH /api/v1/dashboard/bulletin/:id` para atualizar itens ou status do recado.
   - Emitir evento `house:note_updated` via WebSocket na sala da residência `house:${houseId}`.
   - Permitir que qualquer morador da casa marque ou desmarque itens da lista de compras em tempo real (ex.: um morador no mercado marca itens e a família em casa vê a atualização instantânea).

3. **Interface de Usuário no Frontend (`DashboardView.tsx` & `App.tsx`):**
   - **Modal de Criação:**
     - Seletor de tipo de recado: `[ Recado de Texto ]` e `[ Checklist / Lista de Compras ]`.
     - No modo checklist: inputs para adicionar itens à lista dinamicamente, listagem com remoção antes de salvar, além de título e cor.
   - **Card de Exibição no Mural:**
     - Ícone/badge indicando o total de itens concluídos (ex.: `2/4 itens`).
     - Lista de checkboxes interativos para cada item.
     - Ao clicar no checkbox: atualização otimista imediata (0ms), persistência assíncrona via `PATCH` e broadcast via WebSocket para os outros moradores da casa.
     - Texto riscado (`line-through`) e opacidade suave para itens marcados.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Atende diretamente à demanda do usuário restaurando e aprimorando o conceito de listas de compras.
  - Zero migração DDL no PostgreSQL: não interrompe o banco de produção.
  - Sincronização em tempo real entre todos os dispositivos e moradores.
  - Latência percebida de 0ms (atualização otimista local).
- **Desvantagens / Riscos:**
  - Necessidade de garantir que o parser lide de forma graciosa com qualquer variação de JSON ou falha de rede ao alternar checkboxes. (Mitigado com rollback otimista e `try/catch`).

---

## 4. Critérios de Aceitação
- [x] No modal de criação de recado, o morador pode alternar entre "Recado de Texto" e "Checklist / Lista de Compras".
- [x] No modo checklist, é possível adicionar itens com texto, visualizá-los e removê-los antes de fixar no mural.
- [x] No card do mural, os itens aparecem com checkboxes interativos e contador de progresso (ex: `1/3`).
- [x] Marcar ou desmarcar um item atualiza a interface imediatamente (0ms) e persiste no banco de dados.
- [x] Se outro morador estiver com o app aberto na mesma casa, a alteração no checklist reflete em tempo real via WebSocket.
- [x] Recados normais de texto puro continuam funcionando perfeitamente.
- [x] Typechecks (`rtk npm run typecheck`) e testes unitários (`rtk npm run test:unit`) passam com 0 erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend:**
   - Em `dashboard.service.ts`:
     - Atualizar `parseBulletinContent` para extrair `type` e `items`.
     - Atualizar `createBulletinPost` para aceitar `items` e `type`.
     - Implementar `updateBulletinPost(postId, userId, data)` para atualizar itens/conteúdo.
   - Em `dashboard.controller.ts`:
     - Implementar método `updateBulletinPost` e broadcast `house:note_updated`.
   - Em `dashboard.routes.ts`:
     - Adicionar rota `PATCH /bulletin/:id`.
   - Em `socketServer.ts`:
     - Adicionar listener para `house:note_updated`.
2. **Frontend:**
   - Em `dashboardApi.ts`:
     - Adicionar método `updateBulletinPost(postId, houseId, userId, data, token)`.
   - Em `services/socket.ts`:
     - Adicionar ouvinte `onNoteUpdated(callback)`.
   - Em `App.tsx`:
     - Adicionar handler `handleToggleNoteItem(noteId, itemId)` com atualização otimista e chamada à API.
     - Adicionar listener `onNoteUpdated` para sincronizar no estado `muralNotes`.
     - Atualizar `handleAddMuralNote` para aceitar `items` e `type`.
   - Em `DashboardView.tsx`:
     - Adicionar alternador de tipo (Texto / Checklist) no modal de criação de recado.
     - Adicionar seção de inserção de itens no modal.
     - Renderizar lista de checkboxes interativos no card do mural quando o recado tiver `items`.
3. **Validação & Testes:**
   - Executar `rtk npm run typecheck` no frontend e no backend.
   - Executar `rtk npm run test:unit` no backend.
4. **Governança & Documentação:**
   - Atualizar `docs/pages/dashboard.md` com a especificação de checklists e listas de compras.
   - Realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend - 0 erros)
- [x] `rtk npm run typecheck` (Backend - 0 erros)
- [x] `rtk npm run test:unit` (Backend - 51/51 testes aprovados)

---

## 7. Sincronização com /docs
- [x] Documento `docs/tasks/2026-09-13-mural-checklist-lista-de-compras.md` criado
- [x] `docs/pages/dashboard.md` atualizado com o suporte a checklists
- [x] Matriz de governança verificada em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
