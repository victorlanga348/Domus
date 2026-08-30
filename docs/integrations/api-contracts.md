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

## 4. Endpoints de Salas Privadas & Governança (`/api/rooms`)

### `GET /api/rooms/my-rooms`
- Lista exclusivamente as salas onde o usuário logado já é um `Participant` confirmado.
- **Headers:** `x-user-id`
- **Resposta (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid-room",
        "title": "Planejamento Financeiro",
        "is_protected": true,
        "is_member": true,
        "my_role": "ARCHITECT",
        "members_count": 3,
        "messages_count": 15
      }
    ]
  }
  ```

### `POST /api/rooms` (Fundar Nova Sala)
- Cria uma nova sala protegida e vincula o criador como `ARCHITECT`.
- **Regra:** Título da sala deve ser único (retorna `409 Conflict` caso já exista).
- **Payload:** `{ "title": "ProjetoX", "password": "secretPassword123" }`
- **Headers:** `x-user-id`, `x-house-id`
- **Resposta (201):** Objeto da sala criada com o criador em `Participant` (`role: ARCHITECT`).

### `POST /api/rooms/join` (Entrada Privada por Credenciais)
- Valida o par `title` e `password` via `bcrypt.compare`.
- **Segurança Anti-Enumeração:** Retorna `401 Unauthorized` com mensagem `"Credenciais da sala inválidas"` tanto para título inexistente quanto para senha incorreta.
- **Payload:** `{ "title": "ProjetoX", "password": "secretPassword123" }`
- **Headers:** `x-user-id`
- **Resposta (200):** Objeto da sala com participantes e confirmação de entrada.

### `PATCH /api/rooms/:id/promote`
- Promove um membro da sala para o cargo de `ARCHITECT`.
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
