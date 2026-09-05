# Task: Integração Frontend Real-time (Socket.io, BFF Dashboard & Estatísticas)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/pages/dashboard.md]]`, `[[docs/pages/statistics.md]]`, `[[docs/integrations/api-contracts.md]]`

---

## 1. Contexto & Problema
O backend do DOMUS agora possui todos os endpoints consolidados:
- Endpoint BFF agregador (`GET /api/v1/dashboard`);
- Endpoint de estatísticas analíticas (`GET /api/v1/statistics`);
- Execução de tarefas com PIN e 3 Vias (`PATCH /api/tasks/:id/(complete|block|fail)`);
- Servidor WebSocket com Socket.io para difusão de locks em tempo real (`task:locking`, `task:locked`, `task:unlocked`, `member:vacation_changed`, `task:swap_requested`).

O frontend precisa ser conectado a esses serviços em tempo real, substituindo dados estáticos por chamadas de rede reativas e sincronização em tempo real entre moradores.

---

## 2. Solução Proposta

### 2.1 Cliente WebSocket (`socket.io-client`)
- Instalar `socket.io-client` no frontend.
- Criar serviço centralizado `frontend/src/shared/socket/socketClient.ts` conectado ao servidor `http://localhost:3333`.
- Ingressar automaticamente na sala `house:<houseId>`.
- Escutar e propagar reativamente eventos:
  - `task:locked`: atualiza o card da tarefa imediatamente com o nome do morador em execução;
  - `task:unlocked`: restaura o card para o estado aberto;
  - `member:vacation_changed`: atualiza o status de férias e recalcula o rodízio;
  - `task:swap_requested`: exibe notificação/toast de solicitação de troca.

### 2.2 Camada de API do Frontend
- `dashboardApi.ts`: Consumir `GET /api/v1/dashboard`.
- `statisticsApi.ts`: Consumir `GET /api/v1/statistics` (Índice de Harmonia 0-100, ranking de contribuição, gráfico de turnos).
- `tasksApi.ts`: Consumir rotas `complete`, `block`, `fail`, `lock`, `delete` e `request-swap`.

### 2.3 Telas & Componentes
- **`DashboardView.tsx`:** Alimentado em uma única chamada pelo BFF, renderizando cards de tarefas do turno ativo com indicação do responsável A-Z, modal de execução com PIN e mural de avisos.
- **`StatisticsView.tsx`:** Renderiza o medidor de harmonia, maior contribuidor do mês e gráfico de pizza/barras de contribuições.
- **`TasksRotationView.tsx`:** Lista completa de tarefas com filtros por turno, modal de criação com seleção do pool de participantes e ações de governança.

---

## 3. Análise de Trade-offs
- **Vantagens:**
  - Carregamento instantâneo via padrão BFF (1 requisição inicial).
  - Experiência colaborativa sem conflitos através do WebSocket.
  - Feedback visual imediato ao executar tarefas ou ativar modo férias.
- **Desvantagens / Riscos:**
  - Requer conexão com o backend em execução para visualização de dados vivos (mantendo fallbacks elegantes se o backend estiver inicializando).

---

## 4. Critérios de Aceitação
- [x] `socket.io-client` instalado e configurado no frontend.
- [x] Conexão e ingresso automático na sala da casa (`house:join`).
- [x] Cards de tarefas reagindo a eventos `task:locked` e `task:unlocked` em tempo real.
- [x] Tela de Dashboard consumindo `GET /api/v1/dashboard` via BFF.
- [x] Tela de Estatísticas consumindo `GET /api/v1/statistics` exibindo Índice de Harmonia real.
- [x] Modal de conclusão solicitando PIN e chamando `completeTask`.
- [x] Typecheck e builds passando sem erros no frontend e backend.

---

## 5. Plano de Implementação (Passo a Passo)
1. Instalar `socket.io-client` no diretório `frontend`.
2. Criar `frontend/src/shared/socket/socketClient.ts` e hook `useHouseSocket.ts`.
3. Atualizar as camadas de API em `frontend/src/features/dashboard/api/dashboardApi.ts`, `statisticsApi.ts` e `tasksApi.ts`.
4. Integrar o Dashboard (`DashboardView.tsx`) com os dados do BFF e eventos de Socket.
5. Integrar a aba de Estatísticas (`StatisticsView.tsx`) com o `AnalyticsService`.
6. Conectar a aba de Rodízio de Tarefas (`TasksRotationView.tsx`) com criação de tarefas e ações de execução com PIN.
7. Executar typecheck e build em ambos os projetos com `rtk`.
