# Task: Sprint 4 - A Ponte de Comunicação (API, Middlewares & Dashboard BFF)
**Data:** 2026-08-30  
**Status:** Concluída  
**Specs Impactadas:** `[[docs/integrations/api-contracts.md]]`, `[[docs/architecture/security.md]]`, `[[docs/pages/dashboard.md]]`

---

## 1. Contexto & Objetivos
Implementação dos contratos de API, camada de proteção (Middlewares de Autenticação e Erros) e o endpoint agregador (BFF) do Dashboard:
- **Middlewares:**
  - `authMiddleware.ts`: Validação de JWT, injeção de `req.userId`, `req.houseId`, `req.user` e garantia de isolamento multitenant.
  - `errorHandler.ts`: Tratamento global de erros JSON com captura de erros do Prisma (`P2002`, `P2025`), JWT e `AppError`.
- **Endpoints de Autenticação & Residência:**
  - `POST /api/auth/register` (Nome, Email, Senha, PIN).
  - `POST /api/auth/login` (Email, Senha) ➔ Emissão de JWT + dados do usuário.
  - `POST /api/house/create` (ou `/api/houses/create`): Criação com papel de `ADMIN` (Arquiteto Principal).
  - `POST /api/house/join` (ou `/api/houses/join`): Entrada via senha com papel de `MEMBER`.
- **Endpoint Agregador BFF:**
  - `GET /api/v1/dashboard` (e `GET /api/dashboard`): Retorna em viagem de rede única as tarefas do turno atual (`MORNING`, `AFTERNOON`, `NIGHT`), o "Próximo da Vez" de cada tarefa calculado pelo `RotationService`, os últimos 5 avisos do `BulletinBoard`, contadores de harmonia e lista de moradores com status de férias.
- **Execução de Tarefas:**
  - `PATCH /api/tasks/:id/complete` (com validação opcional de PIN, avanço de rodízio e registro de log).
  - `PATCH /api/tasks/:id/block` (com motivo de bloqueio).
  - `PATCH /api/tasks/:id/fail` (com registro de falha sem avançar índice).
  - `POST /api/tasks` (criação com pool seletivo de participantes).

---

## 2. Critérios de Aceitação
- [x] Middleware `authMiddleware` protegendo rotas com token JWT e extração de contexto tenant.
- [x] Middleware `errorHandler` capturando erros operacionais, JWT e violações do Prisma.
- [x] Rotas `/api/auth/register`, `/api/auth/login`, `/api/house/create`, `/api/house/join` funcionais.
- [x] Endpoint agregador `GET /api/v1/dashboard` consolidando tarefas de turno, próximo da vez, avisos e membros.
- [x] Rotas de execução `PATCH /api/tasks/:id/(complete|block|fail)` funcionais.
- [x] Typecheck e builds passando sem erros.
