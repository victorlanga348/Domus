# Task: Sprint 5 - Real-time, Governança e Inteligência (Master Backend)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/integrations/api-contracts.md]]`, `[[docs/pages/statistics.md]]`, `[[docs/architecture/security.md]]`

---

## 1. Contexto & Objetivos
Finalização do Master Backend do DOMUS com recursos de comunicação em tempo real, proteção contra concorrência, inteligência analítica e governança de permissões:
- **Lock em Tempo Real via Socket.io:**
  - Namespace e salas por residência (`house:<houseId>`).
  - Evento `task:locking` com validação no banco e difusão de `task:locked` para todos os moradores conectados.
  - Job periódico de expiração (5 min) destrancando automaticamente tarefas em `LOCKED` há mais de 45 minutos.
- **Inteligência Analítica & Índice de Harmonia:**
  - `AnalyticsService` calculando o Índice de Harmonia da casa (0-100), ranking de contribuição por membro (% de tarefas concluídas no mês), maior contribuidor e distribuição por turno.
  - Endpoints `GET /api/v1/statistics` e `GET /api/statistics`.
- **Governança & Permissões:**
  - `DELETE /api/tasks/:id`: Restrito exclusivamente ao `ADMIN` (Arquiteto) ou ao criador da tarefa.
  - `PATCH /api/auth/vacation`: Alternância do modo férias com disparo de alerta WebSocket `member:vacation_changed`.
  - `POST /api/tasks/:id/request-swap`: Solicitação de troca de escala com emissão de evento `task:swap_requested`.
- **Produção & Resiliência:**
  - Rate limiting (`express-rate-limit`) em rotas sensíveis de login e PIN.
  - Módulo de logging estruturado com timestamp.

---

## 2. Critérios de Aceitação
- [x] Socket.io configurado e integrado ao servidor HTTP na subida do backend.
- [x] Eventos de lock em tempo real (`task:locking`, `task:locked`, `task:unlocked`) operacionais.
- [x] Job de timeout de locks (45 min) em execução periódica.
- [x] `AnalyticsService` e endpoint `GET /api/v1/statistics` fornecendo métricas de harmonia.
- [x] Permissão de deleção de tarefas respeitando regras de ADMIN e criador.
- [x] Endpoints `/auth/vacation` e `/tasks/:id/request-swap` com broadcast em tempo real.
- [x] Rate limiting aplicado nas rotas de autenticação.
- [x] Typecheck e builds passando sem erros no backend e frontend.
