# Task: Sprint 3 - Motor de Rodízio A-Z & Serviços de Tarefas (Rotation Engine)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/data-model.md]]`, `[[docs/modules/tasks.md]]`

---

## 1. Contexto & Lógica de Negócio
Implementação do motor central de rodízio de tarefas domésticas do DOMUS:
- **Ordenação Alfabética Rigorosa (A-Z):** O pool de participantes associados via `TaskParticipant` é ordenado lexicograficamente por `user.name`.
- **Regra de Salto por Férias:** Moradores com `vacation_mode: true` são ignorados no turno, saltando automaticamente para o próximo morador elegível na fila circular.
- **Rotação Circular (`rotateTask`):** Ao concluir a tarefa, o `rotation_index` avança na fila circular (`index = (index + 1) % poolSize`), retornando a zero ao atingir o final da lista.

---

## 2. Implementação
- [backend/src/modules/tasks/tasks.rotation.service.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.rotation.service.ts)
- [backend/src/core/services/RotationService.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/core/services/RotationService.ts)
- [backend/src/modules/tasks/tasks.service.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.service.ts)
- [backend/src/modules/tasks/tasks.controller.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.controller.ts) & [tasks.routes.ts](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.routes.ts) (`GET /api/tasks/:id/assignee`)

---

## 3. Critérios de Aceitação
- [x] `getNextParticipant` ordenando alfabeticamente A-Z.
- [x] Salto de moradores em `vacation_mode: true`.
- [x] Lançamento de erro caso todos os participantes estejam de férias.
- [x] `rotateTask` avançando o `rotation_index` circularmente e resetando status de lock.
- [x] Typecheck e build passando sem erros no backend e frontend.
