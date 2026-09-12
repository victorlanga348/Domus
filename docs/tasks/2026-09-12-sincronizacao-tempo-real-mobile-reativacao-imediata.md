# Task: Sincronização em Tempo Real Mobile e Reativação Imediata (Wake / Resume Sync)

**Data:** 2026-09-12  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/architecture/concurrency-and-locks.md]]`, `[[docs/integrations/api-contracts.md]]`, `[[docs/design/responsive.md]]`

---

## 1. Contexto & Problema
No aplicativo móvel (PWA / Navegador mobile), quando um morador deixa o app em segundo plano, bloqueia o celular ou alterna entre apps:
1. **Desconexão Definitiva do WebSocket (`reconnectionAttempts: 10`):** Ao suspender a execução ou desligar a tela, o sistema operacional encerra/pausa as conexões de rede em segundo plano. O cliente Socket.IO esgotava suas 10 tentativas em ~15 segundos e desistia permanentemente. Ao reabrir o app sem fechá-lo (sem matar o processo no multitarefa), o WebSocket continuava inativo e não recebia nenhum evento.
2. **Ausência de Re-sincronização na Retomada (`visibilitychange` / `focus` / `pageshow` / `online`):** Quando o usuário volta ao aplicativo, nenhum listener de ciclo de vida detectava o retorno ao primeiro plano para forçar a reconexão do socket nem buscava o estado atualizado do backend. Como o WebSocket não possui buffer de replay para eventos ocorridos durante a suspensão, o app ficava com dados desatualizados até ser forçadamente fechado e reaberto do zero.
3. **Mutações REST sem Transmissão WebSocket no Backend:** Endpoints do backend que executam mutações (criação, edição, bloqueio, exclusão de tarefas, refeições, regras, status de moradores e mural de recados) nem sempre emitiam o evento `emitToHouse` para a sala da casa, dependendo exclusivamente de emissões do frontend que podiam falhar silenciosamente no ambiente mobile.
4. **Falta de Polling de Heartbeat em Primeiro Plano:** Em redes celulares móveis instáveis (4G/5G/Wi-Fi), oscilações silenciosas podiam degradar a conexão sem disparar o evento de reconexão imediatamente.

---

## 2. Solução Proposta

1. **Reconexão Infinita e Resiliente no Socket.IO (`socketClient.ts`):**
   - Configurar `reconnectionAttempts: Infinity` com `reconnectionDelay: 1000` e `reconnectionDelayMax: 5000`.
   - Implementar função de verificação ativa `ensureSocketConnected()` que reconecta imediatamente caso o socket esteja desconectado.

2. **Motor de Sincronização e Ciclo de Vida Mobile (`App.tsx` & `useHouseSocket.ts`):**
   - Centralizar todas as requisições de leitura em uma função robusta `syncAllHouseData({ silent?: boolean })`.
   - Adicionar listeners globais de ciclo de vida:
     - `document.addEventListener('visibilitychange')`: Ao transitar para `document.visibilityState === 'visible'`, reativa o socket se necessário e executa `syncAllHouseData({ silent: true })`.
     - `window.addEventListener('focus')`, `window.addEventListener('pageshow')` e `window.addEventListener('online')`: Disparam verificação de conexão e sincronização imediata.
     - `socket.on('connect')`: Ao restabelecer conexão com o servidor, reingressa na sala da residência (`house:join`) e sincroniza todos os dados para refletir mudanças ocorridas enquanto desconectado.
   - Adicionar Heartbeat Polling em primeiro plano (ex: a cada 12 segundos) condicionado estritamente a `document.visibilityState === 'visible'` para garantir consistência total sem drenar bateria quando minimizado.

3. **Garantia de Broadcast WebSocket em Todas as Mutações no Backend:**
   - Garantir que todos os controllers de mutação (`tasks.controller.ts`, `meals.controller.ts`, `rules.controller.ts`, `member-statuses.controller.ts`, `dashboard.controller.ts`, `preferences.controller.ts`) chamem `emitToHouse(houseId, event, payload)` imediatamente após a gravação no banco de dados.
   - Eventos cobertos:
     - Tarefas: `house:task_created`, `house:task_updated`, `house:task_deleted`, `house:task_status_changed`, `task:locked`, `task:unlocked`, `house:rotation_advanced`.
     - Cardápio: `house:meal_updated`, `house:meal_deleted`, `house:meal_lock_toggled`.
     - Mural: `house:note_created`, `house:note_deleted`.
     - Status: `house:status_changed`.
     - Regras: `house:rule_created`, `house:rule_deleted`.
     - Membros: `house:members_updated`, `member:vacation_changed`.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - O aplicativo reflete alterações **imediatamente** em tempo real entre todos os dispositivos (celular, tablet e computador).
  - Ao desbloquear a tela ou alternar de volta para o Domus no celular, todos os dados são atualizados instantaneamente em background sem necessidade de matar o app ("tirar do minimizar").
  - O polling é pausado automaticamente quando o app está em segundo plano para poupar 100% da bateria e dados móveis do usuário.
  - O backend garante a entrega dos eventos em tempo real mesmo se a mutação partir de chamadas REST puras.
- **Desvantagens / Riscos:**
  - Requisições extras na reativação (mitigado pelo fato de serem chamadas leves em paralelo e apenas quando a aba se torna visível).

---

## 4. Critérios de Aceitação
- [x] O socket continua tentando reconectar indefinidamente após suspensão prolongada da tela/aparelho.
- [x] Ao alternar de outro aplicativo de volta para o Domus ou desbloquear a tela, os dados da residência (tarefas, cardápio, recados, presença, status) são sincronizados imediatamente.
- [x] Qualquer ação realizada por outro usuário (concluir tarefa, trancar, alterar cardápio, postar recado) reflete instantaneamente na tela do celular aberto sem precisar recarregar.
- [x] Não há consumo de rede/polling enquanto o app estiver minimizado (`document.hidden === true`).
- [x] Typecheck e build do frontend e backend passam com 0 erros.

---

## 5. Plano de Implementação (Passo a Passo)
1. Atualizar [frontend/src/shared/socket/socketClient.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/shared/socket/socketClient.ts) para `reconnectionAttempts: Infinity` e expor helper de reconexão forçada.
2. Atualizar [frontend/src/App.tsx](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/frontend/src/App.tsx) encapsulando `syncAllHouseData` e implementando listeners de `visibilitychange`, `focus`, `online`, `pageshow` e heartbeat de primeiro plano.
3. Atualizar controllers do backend ([backend/src/modules/tasks/tasks.controller.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/tasks/tasks.controller.ts), [backend/src/modules/meals/meals.controller.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/meals/meals.controller.ts), [backend/src/modules/rules/rules.controller.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/rules/rules.controller.ts), [backend/src/modules/member-statuses/member-statuses.controller.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/member-statuses/member-statuses.controller.ts), [backend/src/modules/dashboard/dashboard.controller.ts](file:///C:/Users/victo/OneDrive/Documentos/Github/Domus/backend/src/modules/dashboard/dashboard.controller.ts)) para emitir eventos de socket em todas as mutações.
4. Executar validação técnica completa (`rtk npm run typecheck`, `rtk npm run test:unit`, `rtk npm run build`).
5. Sincronizar documentação em `/docs`.

---

## 6. Validação e Testes
- [x] `rtk npm run typecheck` (frontend)
- [x] `rtk npm run typecheck` (backend)
- [x] `rtk npm run build` (frontend)
- [x] `rtk npm run test:unit` (backend)

---

## 7. Sincronização com /docs
- [x] `docs/architecture/concurrency-and-locks.md`
- [x] `docs/integrations/api-contracts.md`
- [x] `docs/design/responsive.md`
