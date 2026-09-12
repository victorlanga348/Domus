# Task: Otimização de Latência, Atualizações Otimistas (Instant UI) e Ajuste de Polling
**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/tasks-rotation.md]]`, `[[docs/product/meals-menu.md]]`, `[[docs/architecture/system-overview.md]]`

---

## 1. Contexto & Problema
O usuário relatou que a aplicação demora para processar e refletir qualquer ação de criação, exclusão ou conclusão de itens no sistema (recados, tarefas, refeições, regras, status).

**Diagnóstico da Causa Raiz:**
1. **Ausência de Optimistic UI (Atualização Otimista):**
   - Os handlers de criação/edição/exclusão em [App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) aguardavam a resolução completa do `await apiCall()` pela rede antes de chamar `setState()`. Se a requisição levasse 200ms a 1.5s, a interface permanecia estática, dando sensação de lentidão e travamento.
2. **Polling Agressivo de 7 Endpoints a cada 12 segundos:**
   - O heartbeat executava `syncAllHouseData` a cada 12 segundos disparando simultaneamente 7 chamadas HTTP (`dashboard`, `tasks`, `logs`, `rules`, `preferences`, `meals`, `statuses`). Isso sobrecarregava o Node.js/PostgreSQL e causava re-renderizações desnecessárias em massa na thread do React.
3. **Overhead de Logging no Prisma:**
   - O Prisma Client logava todas as consultas SQL brutas no console (`query: ...`), gerando gargalo de I/O dentro do container Docker.
4. **Duplicação de Emissão de Eventos WebSockets:**
   - O frontend e o backend emitiam eventos simultaneamente para a mesma sala Socket.io na mesma ação de criação/alteração.

---

## 2. Solução Proposta & Executada
1. **Implementar Optimistic UI (Resposta em 0ms):**
   - **Tarefas:** Adicionar/excluir a tarefa no estado do React imediatamente ao clicar, sincronizando a persistência no backend em segundo plano com rollback automático caso ocorra erro.
   - **Mural de Recados:** Adicionar e remover notas do mural de forma instantânea na UI (0ms).
   - **Cardápio de Refeições:** Atualizar pratos e remover refeições imediatamente no DOM.
   - **Regras da Residência:** Inserção e remoção instantânea na UI.
2. **Ajuste do Heartbeat de Sincronização:**
   - Aumentado o intervalo do polling passivo de 12s para 60s, priorizando os eventos em tempo real via WebSockets (Socket.io).
3. **Redução de Logs de Query no Prisma:**
   - Ajustado o nível de log do Prisma Client no backend para `['error', 'warn']`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - **Sensação Instantânea:** O usuário vê o resultado de qualquer clique (criar, concluir, apagar) em 0 milissegundos.
  - **Desempenho e Eficiência:** Queda de mais de 80% nas requisições em background ao servidor e alívio na CPU do dispositivo móvel/navegador.
  - **Confiabilidade:** Se houver erro de rede, o rollback otimista restaura o estado anterior e exibe toast explicativo.
- **Desvantagens / Riscos:**
  - Em conexões instáveis com queda total de sinal, se a requisição falhar no servidor, o item inserido otimisticamente será revertido com notificação explicativa.

---

## 4. Critérios de Aceitação
- [x] Ao clicar em criar/concluir/excluir uma tarefa, a ação reflete imediatamente na tela (0ms de latência perceptível).
- [x] Ao fixar ou remover um recado no mural, o card aparece ou desaparece instantaneamente.
- [x] Ao adicionar ou remover um prato do cardápio, a interface atualiza na hora.
- [x] O heartbeat não sobrecarrega a rede com requisições a cada 12 segundos.
- [x] Erros de requisição revertem o estado otimista e exibem feedback claro.

---

## 5. Plano de Implementação (Passo a Passo)
1. [x] Ajustar `backend/src/database/prisma.ts` para eliminar logs desnecessários de query.
2. [x] Atualizar [frontend/src/App.tsx](file:///c:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx):
   - Refatorar `handleAddTask`, `handleDeleteTask`, `handleTaskStatusChange`, `handleAddMuralNote`, `handleDeleteMuralNote`, `handleUpdateMeal`, `handleDeleteMeal`, `handleAddHouseRule` para aplicar **Optimistic Updates** com rollback em caso de erro.
   - Ajustar o intervalo do heartbeat para 60 segundos com verificação passiva.
3. [x] Validar builds e testes via terminal (`rtk`).
