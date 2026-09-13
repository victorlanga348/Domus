# Task: Idempotência na Exclusão e Deduplicação Definitiva de Recados no Mural
**Data:** 2026-09-13  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/dashboard.md]]`, `[[docs/architecture/realtime-sync.md]]`, `[[docs/tasks/2026-09-13-correcao-duplicacao-recados-mural.md]]`

---

## 1. Contexto & Problema
Ao tentar excluir certos recados no mural (especialmente recados legados, notas temporárias ou duplicatas criadas antes da centralização no backend):
1. **Erro 404 do Backend ("Recado não encontrado no mural."):**
   - Quando o ID do recado já foi apagado do banco ou possui um identificador temporário/órfão (`temp_n_...`), o backend lançava erro 404 (`POST_NOT_FOUND`).
2. **Rollback Involuntário no Frontend:**
   - No bloco `catch` de `handleDeleteMuralNote` em `App.tsx`, o frontend restaurava o array `previousNotes` anterior, fazendo com que a nota excluída reaparecesse na tela.
3. **Colisão de Chaves no React / Efeito de "Duplicação Visual":**
   - Com recados que possuíam o mesmo ID no estado do `localStorage` (remanescentes do bug anterior), o Framer Motion e o reconciliador do React sofriam colisão de chaves (`key={note.id}`). Ao tentar remover uma, ambas sumiam temporariamente e, após o erro 404, ambas reapareciam juntas, gerando a percepção de que a nota "duplicou ao tentar apagar".
4. **Falta de Token na Sincronização Geral (`syncAllHouseData`):**
   - Em `App.tsx`, a chamada `dashboardApi.getDashboardData(houseId, userId)` não passava o `authToken`, resultando em 401 e impedindo que o estado local de `muralNotes` fosse limpo e alinhado com o banco de dados oficial.

---

## 2. Solução Proposta
1. **Idempotência no Backend (`dashboard.service.ts`):**
   - Na função `deleteBulletinPost`, se o recado já não for encontrado no banco (`!post`), retornar sucesso idempotente (`{ success: true, message: 'Recado já removido do mural.' }`) em vez de lançar 404. O objetivo da exclusão já está cumprido.
2. **Tratamento Seguro de Exclusão no Frontend (`App.tsx`):**
   - Se o ID a ser excluído for uma nota temporária (`temp_n_...`), remover do estado local imediatamente sem enviar requisição inútil ao servidor.
   - Caso uma requisição de exclusão retorne 404, não realizar rollback da nota (garantindo que recados órfãos sejam eliminados da tela definitivamente).
3. **Deduplicação Proativa e Higienização de `muralNotes` (`App.tsx`):**
   - Implementar função `deduplicateNotes` ao carregar do `localStorage` e ao atualizar `muralNotes`, garantindo que notas com IDs repetidos ou notas temporárias com conteúdo idêntico sejam purgadas.
4. **Envio de `authToken` em `syncAllHouseData` (`App.tsx`):**
   - Incluir `authToken || undefined` na chamada de `dashboardApi.getDashboardData`, permitindo que o mural sincronize perfeitamente com os recados reais do PostgreSQL.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Exclusão 100% resiliente: qualquer recado visível na tela poderá ser excluído sem erros, inclusive notas temporárias e legadas.
  - Elimina colisões de `key` no React e o glitch visual de reaparição/duplicação.
  - Limpa automaticamente notas fantasmas antigas salvas no `localStorage`.
- **Desvantagens / Riscos:**
  - Nenhuma; a idempotência é o comportamento padrão preconizado pela especificação HTTP/REST (RFC 7231) para o método `DELETE`.

---

## 4. Critérios de Aceitação
- [x] Qualquer recado no mural pode ser excluído com sucesso sem mensagens de "Recado não encontrado".
- [x] Recados temporários e legados somem imediatamente e não retornam.
- [x] O array de recados não possui IDs duplicados ou colisões no React.
- [x] `syncAllHouseData` sincroniza o mural autenticado com o backend sem erros 401.
- [x] Typechecks e testes unitários passam com 0 erros via `rtk`.

---

## 5. Plano de Implementação (Passo a Passo)
1. Em `backend/src/modules/dashboard/dashboard.service.ts`:
   - Tornar `deleteBulletinPost` idempotente retornando sucesso quando o recado não existe.
2. Em `frontend/src/App.tsx`:
   - Adicionar sanitizador `deduplicateNotes` no estado inicial e nos setters de `muralNotes`.
   - Ajustar `handleDeleteMuralNote` para ignorar chamada de rede em `temp_n_` e não restaurar notas inexistentes.
   - Adicionar `authToken` na chamada de `getDashboardData` em `syncAllHouseData`.
3. Executar `rtk npm run typecheck` e `rtk npm run test:unit`.
4. Atualizar spec e realizar commit em português.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (Frontend)
- [x] `rtk npm run typecheck` (Backend)
- [x] `rtk npm run test:unit` (Backend)

---

## 7. Sincronização com /docs
- [x] Tarefa documentada em `docs/tasks/2026-09-13-idempotencia-exclusao-e-deduplicacao-recados-mural.md`
- [x] Matriz de governança conferida em [docs/documentation-governance.md](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/docs/documentation-governance.md)
