# Task: Correção de Título dos Recados e Fim da Duplicação em Tarefas e Regras
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/dashboard.md]]`, `[[docs/product/tasks-and-rotations.md]]`, `[[docs/architecture/realtime-sync.md]]`

---

## 1. Contexto & Problema
1. **Título dos Recados não Visível no Mural:**
   - Ao preencher o campo opcional "Título do Recado" no modal de novo recado, o título não persistia ao recarregar a tela ou sincronizar com o banco de dados, sendo exibido sempre o fallback genérico `"Aviso da Casa"`.
   - A tabela `bulletin_board` no PostgreSQL não possuía mapeamento de título no schema, e `mapBulletinToMuralNote` no frontend não mapeava o campo `title`.
2. **Duplicação ao Criar Tarefas:**
   - Em `App.tsx`, `handleAddTask` realizava a inserção otimista local (`temp_t_...`) e emitia `emitTaskCreated` pelo socket.
   - O backend, ao salvar no PostgreSQL, emitia novamente `house:task_created` com o UUID real.
   - O ouvinte `onTaskCreated` adicionava a tarefa do socket ao array (pois os IDs diferiam de `temp_t_`), e logo depois o retorno HTTP substituía `temp_t_` pelo UUID real, gerando duas tarefas idênticas na escala e nos rodízios.
3. **Duplicação ao Criar Regras da Casa:**
   - Em `App.tsx`, `handleAddHouseRule` realizava a inserção otimista local (`temp_hr_...`) e emitia `emitRuleCreated` pelo socket.
   - O backend emitia novamente `house:rule_created` com o UUID real.
   - O ouvinte `onRuleCreated` inseria a regra duplicada no array local.

---

## 2. Solução Proposta
1. **Persistência e Exibição do Título dos Recados (Zero DB Migration):**
   - No backend (`dashboard.service.ts`), serializar e desserializar de forma transparente metadados `{ title, text, color }` no campo `content` de `bulletinBoard`.
   - Compatibilidade retroativa total: recados em texto puro permanecem intactos; recados com título extraem `title` e `content` limpos.
   - No frontend (`App.tsx`), atualizar `mapBulletinToMuralNote` para preencher `title` e `color` no `MuralNote`.
2. **Centralização Server-Authoritative para Tarefas e Regras:**
   - Remover as emissões client-side de `emitTaskCreated`, `emitTaskDeleted`, `emitRuleCreated` e `emitRuleDeleted` em `App.tsx`. Apenas o servidor deve emitir os eventos oficiais com UUID do banco de dados.
3. **Reconciliação e Idempotência nos Ouvintes Socket (`onTaskCreated`, `onRuleCreated`):**
   - Reconciliar itens temporários (`temp_t_...`, `temp_hr_...`) no estado local quando o evento canônico do socket chegar, atualizando seus identificadores em vez de duplicar itens na lista.
   - No retorno das requisições HTTP, verificar se o item já foi consolidado pelo WebSocket antes de atualizar o estado.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Título do recado (e cor escolhida) é exibido perfeitamente no mural e persiste entre recarregamentos.
  - Elimina completamente o problema sistêmico de duplicação em tarefas, rodízios e regras da casa.
  - Não requer alteração arriscada de DDL / migração de schema no banco de dados em execução.
  - Mantém latência percebida de 0ms (atualizações otimistas imediatas) sem efeitos colaterais.
- **Desvantagens / Riscos:**
  - Nenhuma.

---

## 4. Critérios de Aceitação
- [x] Recados criados com título exibem o título digitado no card do mural (não apenas o fallback "Aviso da Casa").
- [x] Ao criar uma nova tarefa, ela aparece exatamente 1 vez na lista de tarefas e 1 vez nos rodízios (sem duplicação).
- [x] Ao criar uma nova regra da casa, ela aparece exatamente 1 vez na lista de regras.
- [x] Ao recarregar a página, todas as entidades permanecem únicas e consistentes com o banco de dados.
- [x] Typechecks e testes unitários passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. **Backend (`dashboard.service.ts` & `dashboard.controller.ts`):**
   - Implementar codificação/decodificação de metadados (`title`, `color`) no `content` do mural.
   - Propagar `title` e `color` em `createBulletinPost` e `getDashboardData`.
2. **Frontend (`App.tsx`):**
   - Atualizar `mapBulletinToMuralNote` para extrair e preencher `title` e `color`.
   - Em `handleAddTask`: remover `emitTaskCreated`, implementar reconciliação de `temp_t_`.
   - Em `onTaskCreated`: reconciliar tarefa temporária com mesmo título.
   - Em `handleAddHouseRule`: remover `emitRuleCreated`, implementar reconciliação de `temp_hr_`.
   - Em `onRuleCreated`: reconciliar regra temporária com mesmo título.
3. **Validação & Testes:**
   - Executar `rtk npm run typecheck` no frontend e backend.
   - Executar `rtk npm run test:unit` no backend.
4. **Finalização:**
   - Atualizar spec e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend - 0 erros)
- [x] `rtk npm run typecheck` (Backend - 0 erros)
- [x] `rtk npm run test:unit` (Backend - 49/49 testes aprovados)

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-correcao-titulo-recados-e-duplicacao-tarefas-regras.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
