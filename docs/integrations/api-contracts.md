# Contratos de Integração & Endpoints da API REST

## 1. Padrões Globais
- **Base URL:** `/api`
- **Autenticação:** Header `Authorization: Bearer <jwt_token>`
- **Content-Type:** `application/json`

---

## 2. Endpoints de Autenticação (`/api/auth`)

### `POST /api/auth/verify-house`
- **Payload:** `{ "houseCode": "DOMUS-9021" }`
- **Resposta (200):**
  ```json
  {
    "house": { "id": "uuid", "name": "Residência Alameda" },
    "members": [
      { "id": "uuid-1", "name": "Alice", "avatar": "avatar-url" }
    ]
  }
  ```

### `POST /api/auth/login-pin`
- **Payload:** `{ "userId": "uuid-1", "pin": "1234" }`
- **Resposta (200):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid-1", "name": "Alice", "role": "MEMBER" }
  }
  ```

---

## 3. Endpoints de Tarefas (`/api/tasks`)

### `GET /api/tasks`
- Retorna lista de tarefas da casa com estado atualizado e cálculo de expiração de lock.

### `POST /api/tasks/:id/lock`
- Bloqueia a tarefa para execução imediata (45 min).
- **Resposta (200):** Tarefa com status `LOCKED`, `lockedById` e `lockedAt`.

### `POST /api/tasks/:id/complete`
- Conclui a tarefa e roda o algoritmo de rodízio A-Z com salto de férias.
- **Resposta (200):** Tarefa com status `COMPLETED` e novo `currentAssigneeId`.

### `POST /api/tasks/:id/block`
- **Payload:** `{ "reason": "Falta de produto de limpeza" }`
- **Resposta (200):** Tarefa com status `BLOCKED`.
