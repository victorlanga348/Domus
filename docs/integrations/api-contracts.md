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

---

## 4. Endpoints de Salas & Governança (`/api/rooms`)

### `GET /api/rooms`
- Lista as salas disponíveis para a residência, indicando se é protegida e o papel do usuário.
- **Headers:** `x-house-id`, `x-user-id`
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid-room",
        "title": "Limpeza Geral",
        "is_protected": true,
        "is_member": true,
        "my_role": "ARCHITECT",
        "members_count": 4,
        "messages_count": 12
      }
    ]
  }
  ```

### `POST /api/rooms`
- Cria uma nova sala protegida e vincula o criador automaticamente como `ARCHITECT`.
- **Payload:** `{ "title": "Sala de Jogos", "password": "secretPassword123" }`
- **Headers:** `x-user-id`, `x-house-id`
- **Resposta (201):** Objeto da sala criada com participantes.

### `POST /api/rooms/:id/join`
- Valida a senha da sala via `bcrypt.compare` e adiciona o usuário como `MEMBER`.
- **Payload:** `{ "password": "secretPassword123" }`
- **Headers:** `x-user-id`
- **Resposta (200):** Registro de `Participant`.

### `PATCH /api/rooms/:id/promote`
- Promove um usuário membro da sala para o cargo de `ARCHITECT`.
- **Proteção:** Middleware `ensureArchitect` (Requer que o solicitante seja `ARCHITECT` nesta sala).
- **Payload:** `{ "targetUserId": "uuid-user-2" }`
- **Headers:** `x-user-id`
- **Resposta (200):** Registro atualizado em `Participant`.

### `GET /api/rooms/:id/messages`
- Retorna o histórico de mensagens da sala para participantes autorizados.
- **Headers:** `x-user-id`
- **Resposta (200):** Array de mensagens com dados do autor.

### `POST /api/rooms/:id/messages`
- Envia mensagem na sala para participantes autorizados.
- **Payload:** `{ "text": "Reunião de compras às 18h!" }`
- **Headers:** `x-user-id`
- **Resposta (201):** Mensagem criada.
