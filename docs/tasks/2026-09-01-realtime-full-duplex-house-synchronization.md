# Task: Sincronização Bidirecional em Tempo Real da Residência, Autoria Imutável no Mural e Persistência de Status
**Data:** 2026-09-01  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/tasks-rotation.md]]`, `[[docs/components/modals.md]]`, `[[docs/architecture/security.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
1. **Falha na Atualização de Status:** Ao clicar em "Salvar Meu Status", o status/localização do morador não atualizava visualmente porque a função dependia de registros pré-existentes na lista local e não inseria/substituía de forma resiliente, além de não sincronizar com os outros membros.
2. **Falsificação de Autoria no Mural de Recados:** O modal de criação de recado permitia selecionar qualquer morador da casa como autor através de um `<select>`, possibilitando que um morador se passasse por outro. O autor deve ser **estritamente e imutavelmente o usuário logado**.
3. **Desconexão de Dados Entre Dispositivos:** As tarefas criadas, notas do mural, despesas, regras e alterações de status estavam sendo armazenadas apenas na memória/localStorage do navegador que executou a ação, fazendo com que dois dispositivos na mesma residência não vissem as alterações um do outro em tempo real.

---

## 2. Solução Proposta

### 2.1 Autoria Imutável e Rastreabilidade no Mural
- Removido o seletor `<select>` de autores no modal de novo recado.
- Definido de forma fixa e auditável que o autor do recado é **estritamente o morador autenticado** (`authUser.name`), associando sua identidade visual com selo de "Identidade Verificada".

### 2.2 Correção Resiliente de Atualização de Status
- No `handleUpdateMemberStatus`: implementado `upsert` com correspondência por `id` e `name`.
- Emissão imediata via WebSocket (`house:status_changed`) para que todos os membros na casa vejam o novo status instantaneamente.

### 2.3 Sincronização Bidirecional Total (Full-Duplex Real-Time)
- **Backend WebSocket (`socketServer.ts`):** Adicionado broadcast para:
  - `house:task_created` e `house:task_deleted`
  - `house:task_status_changed`
  - `house:note_created` e `house:note_deleted`
  - `house:status_changed`
  - `house:rule_created` e `house:rule_deleted`
  - `house:rotation_advanced`
- **Frontend Socket Client (`socketClient.ts`, `useHouseSocket.ts`, `App.tsx`):**
  - Implementadas funções de emissão para cada ação disparada na interface.
  - Conectados os ouvintes no `App.tsx` para sincronizar tarefas, notas, status, rodízios e regras instantaneamente em todos os aparelhos conectados à mesma sala da residência.

---

## 3. Análise de Trade-offs & Desvantagens
- **Vantagens:**
  - Experiência colaborativa em tempo real (multi-dispositivo e multi-usuário).
  - Integridade e autenticidade inegociáveis no Mural (sem falsificação de autoria).
  - Status e presenças atualizados instantaneamente em todos os painéis.
- **Desvantagens / Riscos Técnicos:**
  - Maior tráfego de eventos WebSocket, tratado com deduplicação por ID nos hooks de estado do frontend.

---

## 4. Critérios de Aceitação
- [x] O status/localização do morador é salvo e refletido imediatamente na interface e em todos os dispositivos conectados.
- [x] O autor de recados no Mural é estritamente o morador logado (sem possibilidade de escolher outro membro).
- [x] Tarefas criadas ou excluídas em um dispositivo aparecem/somem instantaneamente no outro dispositivo na mesma residência.
- [x] Tarefas marcadas como concluídas ou alteradas refletem instantaneamente no outro dispositivo.
- [x] Recados fixados ou excluídos no mural refletem instantaneamente no outro dispositivo.
- [x] Typecheck e builds de frontend e backend passam com 100% de sucesso.

---

## 5. Validação Técnica
- [x] Frontend Typecheck (`tsc --noEmit`): 0 erros.
- [x] Backend Typecheck (`tsc --noEmit`): 0 erros.
- [x] Frontend Build (`vite build`): Sucesso (2.48s).
- [x] Backend Build (`tsc`): Sucesso.

