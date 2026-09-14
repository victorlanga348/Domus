# Task: Correção de Reversão de Tarefas para Retomada Exata pelo Autor da Conclusão

**Data:** 2026-09-14  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/product/tasks-rotation.md]]`, `[[docs/product/reports-and-metrics.md]]`

---

## 1. Contexto & Problema
Ao reverter uma tarefa de rodízio concluída para o estado pendente, a responsabilidade estava mudando para a pessoa seguinte da escala em vez de retornar exatamente para a pessoa que a havia concluído (como se ela nunca a tivesse feito).

### Causa-Raiz Técnica Isolada:
1. No backend (`tasks.controller.ts`), o método `revertTask` restaurava corretamente o `rotation_index` no banco de dados e emitia `task:updated`. Contudo, logo em seguida, o controller emitia incorretamente o evento WebSocket `house:rotation_advanced`.
2. No frontend (`App.tsx`), o listener `onRotationAdvanced` interpretava o evento de avanço e realizava um `queue.shift()`, avançando a fila em +1 e transferindo a responsabilidade para o morador seguinte.
3. Além disso, o listener `onRotationAdvanced` não estava utilizando o payload `nextAssignee` enviado pelo backend para posicionar o ponteiro com exatidão no morador indicado.

---

## 2. Solução Proposta

1. **Backend (`tasks.controller.ts`):**
   - Remover a emissão de `house:rotation_advanced` do método `revertTask`. A reversão de tarefas deve emitir exclusivamente `house:task_status_changed` (`status: 'OPEN'`) e `task:updated` (com a tarefa restaurada).

2. **Frontend (`App.tsx`):**
   - No listener `onRotationAdvanced`, validar se `nextAssignee` foi fornecido no payload WebSocket e alinhar a flag `isNext` diretamente com o morador indicado (`q.id === nextAssignee.id`), prevenindo dessincronizações caso o array de fila receba eventos concorrentes.
   - Manter a reconciliação e restauração otimista imediata na função `handleTaskStatusChange`, preservando a vez da pessoa que realizou a tarefa.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Fidelidade à Regra Canônica de Reversão:** Ao reverter, a tarefa volta imediatamente para quem a concluiu, como se nunca a tivesse feito.
  - **Eliminação de Efeitos Colaterais no WebSocket:** Impede que eventos de avanço de escala sejam disparados em operações de reversão.
- **Desvantagens / Riscos:**
  - Nenhum risco arquitetural.

---

## 4. Critérios de Aceitação
- [x] Ao reverter uma tarefa concluída de rodízio, a responsabilidade da tarefa pendente retorna exatamente para a pessoa que havia feito a conclusão.
- [x] O carrossel de rodízio e a lista de tarefas atualizam sincronizadamente para todos os moradores da residência via WebSocket (`task:updated` e `house:task_status_changed`).
- [x] O método `revertTask` no controller não emite `house:rotation_advanced`.
- [x] Todos os testes unitários do backend (76/76) e builds continuam aprovados.

---

## 5. Plano de Implementação (Passo a Passo)
1. Ajustar `backend/src/modules/tasks/tasks.controller.ts` para remover a emissão indevida de `house:rotation_advanced` no método `revertTask`.
2. Ajustar `frontend/src/App.tsx` no listener `onRotationAdvanced` para sincronizar `isNext` com precisão por `nextAssignee.id` quando disponível.
3. Executar validação automatizada (`rtk npm test` e `rtk npm run build` em backend e frontend).
4. Atualizar documentações em `/docs`.

---

## 6. Validação e Testes
- [x] `rtk npm test` no backend (76/76 testes aprovados).
- [x] `rtk npm run build` no backend (TypeScript compilation ok).
- [x] `rtk npm run build` no frontend (Vite build ok).

---

## 7. Sincronização com /docs
- [x] `docs/product/tasks-rotation.md` verificado e sincronizado.
- [x] Matriz de governança verificada em `docs/documentation-governance.md`.
